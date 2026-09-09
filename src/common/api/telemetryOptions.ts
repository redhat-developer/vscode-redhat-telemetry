/** Optional configuration for `getRedHatService()` to use an independent telemetry pipeline. */
export interface TelemetryOptions {
  /**
   * Namespace prefix for the custom VS Code setting. The library reads/writes
   * `<telemetryNamespace>.telemetry.enabled`. Must be declared in `contributes.configuration`.
   * An empty string is rejected at construction time.
   */
  telemetryNamespace?: string;

  /** Custom opt-in dialog message. Required (and validated at startup) when `telemetryNamespace` is set. */
  optInMessage?: string;

  /** Overrides the privacy statement URL in the opt-in dialog. */
  privacyStatementUrl?: string;

  /** Overrides the opt-out instructions URL in the opt-in dialog. */
  optOutInstructionsUrl?: string;

  /**
   * When true, `CustomVSCodeSettings.isTelemetryEnabled()` skips the global
   * `telemetry.telemetryLevel` check.
   */
  ignoreGlobalTelemetryLevel?: boolean;
}
