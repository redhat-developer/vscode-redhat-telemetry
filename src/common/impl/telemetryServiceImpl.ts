import { Logger } from '../utils/logger';
import { TelemetrySettings } from '../api/settings';
import { TelemetryEventQueue } from '../impl/telemetryEventQueue';
import { TelemetryService, TelemetryEvent } from '../api/telemetry';
import { ConfigurationManager } from './configurationManager';
import { IdProvider } from '../api/idProvider';
import { Environment } from '../api/environment';
import { transform, isError } from '../utils/events';
import { IReporter } from '../api/reporter';
import { EventTracker } from './eventTracker';
import { Memento } from 'vscode';

/**
 * Implementation of a `TelemetryService`
 */
export class TelemetryServiceImpl implements TelemetryService {
  private startTime: number;
  private eventTracker: EventTracker;

  constructor(globalState: Memento,
              private reporter: IReporter, 
              private queue: TelemetryEventQueue | undefined, 
              private settings: TelemetrySettings, 
              private idManager: IdProvider, 
              private environment: Environment,
              private configurationManager?: ConfigurationManager
            ) {
    this.startTime = this.getCurrentTimeInSeconds();
    this.eventTracker = new EventTracker(globalState);
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
    return this.send({ name: 'startup' });
  }
  public async sendShutdownEvent(): Promise<void> {
    return this.send({ name: 'shutdown', properties: {
      //Sends session duration in seconds
      session_duration: this.getCurrentTimeInSeconds() - this.startTime
    } });
  }

  private async sendEvent(event: TelemetryEvent): Promise<void> {
    //Check against VS Code settings
    const level = this.settings.getTelemetryLevel();
    if (level && ["error","crash"].includes(level) && !isError(event)) {
      return;
    }

    const userId = await this.idManager.getRedHatUUID()
    const payload = transform(event, userId, this.environment);

    //Check against Extension configuration
    const config = await this.configurationManager?.getExtensionConfiguration();
    if (!config || config.canSend(payload)) {

      const dailyLimit = (config)?config.getDailyLimit(payload):Number.MAX_VALUE;
      let count = 0;
      if (dailyLimit < Number.MAX_VALUE) {
        //find currently stored count
        count = await this.eventTracker.getEventCount(payload);
        if (count >= dailyLimit){
          //daily limit reached, do not send event
          Logger.log(`Daily limit reached for ${event.name}: ${dailyLimit}`);
          return;
        }
      }
      return this.reporter.report(payload).then(()=>{
        if (dailyLimit < Number.MAX_VALUE) {
          //update count
          Logger.log(`Storing event count (${count+1}/${dailyLimit}) for ${event.name}`);
          return this.eventTracker.storeEventCount(payload, count+1);
        }
      });
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

  public async dispose(): Promise<void> {
    this.queue?.emptyQueue();
    return this.reporter.closeAndFlush();
  }

  private getCurrentTimeInSeconds(): number {
    const now = Date.now();
    return Math.floor(now/1000);
  }
}