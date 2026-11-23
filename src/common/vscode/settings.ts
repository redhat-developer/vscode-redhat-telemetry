import { env, type WorkspaceConfiguration, workspace } from 'vscode';
import type { TelemetrySettings } from '../api/settings';
import { CONFIG_KEY } from '../impl/constants';

const PRIVACY_FOCUSED_CLIENTS = [/codium/i];

/**
 * Returns the VS Code global telemetry level, honouring legacy settings.
 * Shared by both `VSCodeSettings` and `CustomVSCodeSettings`.
 */
export function getVSCodeTelemetryLevel(): string {
  // Respecting old vscode telemetry settings
  // https://github.com/microsoft/vscode/blob/f09c4124a229b4149984e1c2da46f35b873d23fa/src/vs/platform/telemetry/common/telemetryUtils.ts#L131
  const config = workspace.getConfiguration();
  if (config.get('telemetry.enableTelemetry') === false || config.get('telemetry.enableCrashReporter') === false) {
    return 'off';
  }
  // telemetry is on by default in VS Code and most clones, except for VS Codium (maybe others?)
  const defaultLevel = PRIVACY_FOCUSED_CLIENTS.some((client) => client.test(env.appName ?? '')) ? 'off' : 'all';
  return config.get('telemetry.telemetryLevel', defaultLevel);
}

export class VSCodeSettings implements TelemetrySettings {
  isTelemetryEnabled(): boolean {
    return this.getTelemetryLevel() !== 'off' && getTelemetryConfiguration().get<boolean>('enabled', false);
  }

  getTelemetryLevel(): string {
    return getVSCodeTelemetryLevel();
  }

  isTelemetryConfigured(): boolean {
    return isPreferenceOverridden(`${CONFIG_KEY}.enabled`);
  }

  updateTelemetryEnabledConfig(value: boolean): Thenable<void> {
    return getTelemetryConfiguration().update('enabled', value, true);
  }
}

/**
 * Settings implementation that reads/writes `<telemetryNamespace>.telemetry.enabled`
 * instead of `redhat.telemetry.enabled`.
 */
export class CustomVSCodeSettings implements TelemetrySettings {
  private readonly configKey: string;

  constructor(
    private readonly telemetryNamespace: string,
    private readonly ignoreGlobalTelemetryLevel = false,
  ) {
    if (!telemetryNamespace) {
      throw new Error('telemetryNamespace must be a non-empty string');
    }
    this.configKey = `${telemetryNamespace}.telemetry.enabled`;
  }

  /** The VS Code configuration section for this namespace, e.g. `"myext.telemetry"`. */
  get configSection(): string {
    return `${this.telemetryNamespace}.telemetry`;
  }

  isTelemetryEnabled(): boolean {
    if (!this.ignoreGlobalTelemetryLevel && this.getTelemetryLevel() === 'off') {
      return false;
    }
    return workspace.getConfiguration(this.configSection).get<boolean>('enabled', false);
  }

  getTelemetryLevel(): string {
    return getVSCodeTelemetryLevel();
  }

  isTelemetryConfigured(): boolean {
    return isPreferenceOverridden(this.configKey);
  }

  updateTelemetryEnabledConfig(value: boolean): Thenable<void> {
    return workspace.getConfiguration(this.configSection).update('enabled', value, true);
  }
}

export function getTelemetryConfiguration(): WorkspaceConfiguration {
  return workspace.getConfiguration(CONFIG_KEY);
}

export function isPreferenceOverridden(section: string): boolean {
  const config = workspace.getConfiguration().inspect(section);
  return (
    config?.workspaceFolderValue !== undefined ||
    config?.workspaceFolderLanguageValue !== undefined ||
    config?.workspaceValue !== undefined ||
    config?.workspaceLanguageValue !== undefined ||
    config?.globalValue !== undefined ||
    config?.globalLanguageValue !== undefined
  );
}

export function didUserDisableTelemetry(): boolean {
  if (env.isTelemetryEnabled) {
    return false;
  }
  //Telemetry is not enabled, but it might not be the user's choice.
  //i.e. could be the App's default setting (VS Codium), or
  //then the user only asked for reporting errors/crashes, in which case we can do the same.
  return (
    isPreferenceOverridden('telemetry.telemetryLevel') &&
    workspace.getConfiguration().get('telemetry.telemetryLevel') === 'off'
  );
}
