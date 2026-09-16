import type { CoreAnalytics } from '@segment/analytics-core';
import { sha1 } from 'object-hash';
import type { AnalyticsEvent } from '../api/analyticsEvent';
import type { CacheService } from '../api/cacheService';
import type { IReporter } from '../api/reporter';
import { toErrorMessage } from '../utils/errorMessages';
import { Logger } from '../utils/logger';
/**
 * Sends Telemetry events to a segment.io backend
 */
export class Reporter implements IReporter {
  private identifyInFlight: Promise<void> | undefined;

  constructor(
    private analytics?: CoreAnalytics,
    private cacheService?: CacheService,
    private writeKey?: string,
  ) {}

  public async report(event: AnalyticsEvent): Promise<void> {
    if (!this.analytics) {
      return;
    }
    const payloadString = JSON.stringify(event);
    try {
      switch (event.type) {
        case 'identify': {
          // Skip if we already sent an identify event today.
          const identifyCacheName = this.getIdentifyCacheName();
          this.identifyInFlight = (this.identifyInFlight ?? Promise.resolve())
            .then(async () => {
              const hash = sha1(payloadString);
              const cached = await this.cacheService?.get(identifyCacheName);
              if (hash === cached) {
                Logger.log(`Skipping 'identify' event! Already sent:\n${payloadString}`);
                return;
              }
              Logger.log(`Sending 'identify' event with\n${payloadString}`);
              await this.analytics?.identify(event);
              await this.cacheService?.put(identifyCacheName, hash);
            })
            .catch((e) => Logger.log(`Failed to send 'identify' event ${toErrorMessage(e)}`));
          await this.identifyInFlight;
          break;
        }
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
    } catch (e) {
      Logger.log(`Failed to send event ${toErrorMessage(e)}`);
    }
  }

  public async flush(): Promise<void> {
    if (isFlusheable(this.analytics)) {
      this.analytics.flush();
    }
  }

  public async closeAndFlush(): Promise<void> {
    if (isCloseAndFlusheable(this.analytics)) {
      return this.analytics.closeAndFlush();
    }
  }

  private getIdentifyCacheName(): string {
    // Fall back to "identify" when no writeKey is set (backward compat).
    return this.writeKey ? `${this.writeKey}-identify` : 'identify';
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
