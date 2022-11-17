import Analytics from 'analytics-node';
import { sha1 } from 'object-hash';
import { CacheService } from '../interfaces/cacheService';
import { Logger } from '../utils/logger';
import { AnalyticsEvent } from './AnalyticsEvent';

/**
 * Sends Telemetry events to a segment.io backend
 */
export class Reporter {

  constructor(private analytics?: Analytics, private cacheService?: CacheService) {
  }

  public async report(event: AnalyticsEvent, type: string = 'track'): Promise<void> {
    if (!this.analytics) {
      return;
    }
    const payloadString = JSON.stringify(event);
    switch (type) {
      case 'identify':
        //Avoid identifying the user several times, until some data has changed.
        const hash = sha1(payloadString);
        const cached = await this.cacheService?.get('identify');
        if (hash === cached) {
          Logger.log(`Skipping 'identify' event! Already sent:\n${payloadString}`);
          return;
        }
        Logger.log(`Sending 'identify' event with\n${payloadString}`);
        this.analytics?.identify(event);
        this.cacheService?.put('identify', hash);
        break;
      case 'track':
        Logger.log(`Sending 'track' event with\n${payloadString}`);
        this.analytics?.track(event);
        break;
      case 'page':
        Logger.log(`Sending 'page' event with\n${payloadString}`);
        this.analytics?.page(event);
        break;
      default:
        Logger.log(`Skipping unsupported (yet?) '${type}' event with\n${payloadString}`);
        break;
    }

  }

  public async flush(): Promise<void> {
    this.analytics?.flush();
  }
}
