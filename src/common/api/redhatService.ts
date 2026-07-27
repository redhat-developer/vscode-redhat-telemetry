import type { IdProvider } from './idProvider';
import type { TelemetryService } from './telemetry';

/**
 * Umbrella for Red Hat services.
 */
export interface RedHatService {
  /**
   * Returns a Telemetry service
   */
  getTelemetryService(): Promise<TelemetryService>;
  /**
   * Returns the Red Hat Id manager
   */
  getIdProvider(): Promise<IdProvider>;
}
