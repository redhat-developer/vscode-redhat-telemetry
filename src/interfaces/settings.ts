/**
 * Service determining if Telemetry is configured and enabled.
 */
export interface TelemetrySettings {
  /**
   * Returns `true` if Telemetry is enabled.
   */
  isTelemetryEnabled() : boolean;
  /**
   * Returns `true` if Telemetry is configured (enabled or not).
   */
  isTelemetryConfigured(): boolean;
}