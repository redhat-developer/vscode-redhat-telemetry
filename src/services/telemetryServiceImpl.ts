import { Reporter } from "./reporter";
import { Logger } from "../utils/logger";
import { TelemetrySettings } from "../interfaces/settings";
import { TelemetryEventQueue } from "../utils/telemetryEventQueue";
import { TelemetryService, TelemetryEvent } from "../interfaces/telemetry";
import { CacheService } from "../interfaces/cacheService";
import { ConfigurationManager } from "./configurationManager";
import { IdManager } from "../interfaces/idManager";
import { Environment } from "../interfaces/environment";
import { enhance, isError } from "../utils/events";

/**
 * Implementation of a `TelemetryService`
 */
export class TelemetryServiceImpl implements TelemetryService {
  private startTime: number;

  constructor(
    private reporter: Reporter,
    private queue: TelemetryEventQueue | undefined,
    private settings: TelemetrySettings,
    private idManager: IdManager,
    private environment: Environment,
    private configurationManager?: ConfigurationManager,
  ) {
    this.startTime = this.getCurrentTimeInSeconds();
  }

  /* 
    Collects telemetry data and pushes to a queue when not opted in
    and to segment when user has opted for telemetry 
  */
  public async send(event: TelemetryEvent): Promise<void> {
    Logger.log(`Event received: ${event.name}`);

    if (this.settings.isTelemetryEnabled()) {
      // flush whatever was in the queue, however it's unlikely there's anything left at this point.
      this.flushQueue();
      this.sendEvent(event);
    } else if (!this.settings.isTelemetryConfigured()) {
      // Still waiting for opt-in?, then queue events
      this.queue?.addEvent(event);
    }
  }

  public async sendStartupEvent(): Promise<void> {
    this.startTime = this.getCurrentTimeInSeconds();
    return this.send({ name: "startup" });
  }
  public async sendShutdownEvent(): Promise<void> {
    return this.send({
      name: "shutdown",
      properties: {
        //Sends session duration in seconds
        session_duration: this.getCurrentTimeInSeconds() - this.startTime,
      },
    });
  }

  private async sendEvent(event: TelemetryEvent): Promise<void> {
    //Check against VS Code settings
    const level = this.settings.getTelemetryLevel();
    if (level && ["error", "crash"].includes(level) && !isError(event)) {
      return;
    }

    event = enhance(event, this.environment);
    let payload = {
      userId: await this.idManager.getRedHatUUID(),
      event: event.name,
      properties: event.properties,
      measures: event.measures,
      traits: event.traits,
      context: event.context,
    };

    //Check against Extension configuration
    const config = await this.configurationManager?.getExtensionConfiguration();
    if (!config || config.canSend(payload)) {
      return this.reporter.report(payload, event.type);
    }
  }

  public async flushQueue(): Promise<void> {
    const eventsToFlush = this.queue?.events;
    if (eventsToFlush && this.settings.isTelemetryEnabled()) {
      while (eventsToFlush.length > 0) {
        const event = this.queue?.events?.shift();
        if (event) {
          this.sendEvent(event);
        }
      }
    }
    // No matter what, we need to empty the queue if it exists
    this.queue?.emptyQueue();
  }

  public async dispose() {
    this.queue?.emptyQueue();
    return this.reporter.flush();
  }

  private getCurrentTimeInSeconds(): number {
    const now = Date.now();
    return Math.floor(now / 1000);
  }
}
