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

  /**
   * Returns the telemetry level: value can be either "off", "all", "error" or "crash"
   */
  getTelemetryLevel(): string | undefined;
}