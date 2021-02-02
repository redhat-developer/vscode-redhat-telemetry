import Analytics from 'analytics-node';
import { Environment } from '../interfaces/environment';
import { IdManager } from '../interfaces/idManager';
import { TelemetryEvent } from '../interfaces/telemetry';
import { enhance } from '../utils/events';
import { Logger } from '../utils/logger';

/**
 * Sends Telemetry events to a segment.io backend
 */
export class Reporter {
  private analytics: Analytics | undefined;
  private idManager: IdManager;
  private environment: Environment;

  constructor(analytics: Analytics | undefined, idManager: IdManager, environment: Environment) {
    this.analytics = analytics;
    this.idManager = idManager;
    this.environment = environment;
  }

    
  public async report(event: TelemetryEvent): Promise<void> {
    if (this.analytics) {
      event = enhance(event, this.environment);

      let payload = {
        anonymousId: await this.idManager.getRedHatUUID(),
        event: event.name,
        properties: event.properties,
        measures: event.measures,
        traits: event.traits,
        context: event.context
      };
      const type = (event.type) ? event.type : 'track';
      Logger.log(`Sending ${type} event with\n${JSON.stringify(payload)}`);
      switch (type) {
        case 'identify':
          this.analytics?.identify(payload);
          break;
        case 'track':
          this.analytics?.track(payload);
          break;
        case 'page':
          this.analytics?.page(payload);
          break;
        default:
          break;
      }
    }
  }

  public async flush(): Promise<void> {
    this.analytics?.flush();
  }
}
