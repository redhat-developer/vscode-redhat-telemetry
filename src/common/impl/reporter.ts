import { IReporter } from '../api/reporter';

import { CoreAnalytics } from '@segment/analytics-core';
import { sha1 } from 'object-hash';
import { CacheService } from '../api/cacheService';
import { Logger } from '../utils/logger';
import { AnalyticsEvent } from '../api/analyticsEvent';
import { toErrorMessage } from '../utils/errorMessages';
/**
 * Sends Telemetry events to a segment.io backend
 */
export class Reporter implements IReporter {

  constructor(private analytics?: CoreAnalytics, private cacheService?: CacheService) {
  }

  public async report(event: AnalyticsEvent): Promise<void> {
    if (!this.analytics) {
      return;
    }
    const payloadString = JSON.stringify(event);
    try {

      switch (event.type) {
        case 'identify':
          //Avoid identifying the user several times, until some data has changed.
          const hash = sha1(payloadString);
          const cached = await this.cacheService?.get('identify');
          if (hash === cached) {
            Logger.log(`Skipping 'identify' event! Already sent:\n${payloadString}`);
            return;
          }
          Logger.log(`Sending 'identify' event with\n${payloadString}`);
          await this.analytics?.identify(event);
          this.cacheService?.put('identify', hash);
          break;
        case 'track':
          Logger.log(`Sending 'track' event with\n${payloadString}`);
          await this.analytics?.track(event);
          break;
        case 'page':
          Logger.log(`Sending 'page' event with\n${payloadString}`);
          await this.analytics?.page(event);
          break;
        default:
          Logger.log(`Skipping unsupported (yet?) '${event.type}' event with\n${payloadString}`);
          break;
      }
    } catch (e ) {
      Logger.log("Failed to send event "+ toErrorMessage(e));
    }

  }

  
  public async flush(): Promise<void> {
    if (isFlusheable(this.analytics)){
      this.analytics.flush();
    }
  }

  public async closeAndFlush(): Promise<void> {
    if (isCloseAndFlusheable(this.analytics)){
      return this.analytics.closeAndFlush();
    }
  }
}

interface Flusheable {
  flush(): void;
}

interface CloseAndFlusheable {
  closeAndFlush(): void;
}

function isFlusheable(object: any): object is Flusheable {
  return 'flush' in object;
}

function isCloseAndFlusheable(object: any): object is CloseAndFlusheable {
  return 'closeAndFlush' in object;
}