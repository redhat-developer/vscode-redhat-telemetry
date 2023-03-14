import { env, workspace, WorkspaceConfiguration } from 'vscode';
import { TelemetrySettings } from '../api/settings';
import { CONFIG_KEY } from '../impl/constants';

export class VSCodeSettings implements TelemetrySettings {
  isTelemetryEnabled(): boolean {
    return this.getTelemetryLevel() !== 'off' && getTelemetryConfiguration().get<boolean>('enabled', false);
  }

  getTelemetryLevel(): string {
    //Respecting old vscode telemetry settings https://github.com/microsoft/vscode/blob/f09c4124a229b4149984e1c2da46f35b873d23fa/src/vs/platform/telemetry/common/telemetryUtils.ts#L131
    if (workspace.getConfiguration().get("telemetry.enableTelemetry") == false
      || workspace.getConfiguration().get("telemetry.enableCrashReporter") == false
    ) {
      return "off";
    }
    return workspace.getConfiguration().get("telemetry.telemetryLevel", "off");
  }

  isTelemetryConfigured(): boolean {
    return isPreferenceOverridden(CONFIG_KEY + '.enabled');
  }

  updateTelemetryEnabledConfig(value: boolean): Thenable<void> {
    return getTelemetryConfiguration().update('enabled', value, true);
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
  return isPreferenceOverridden("telemetry.telemetryLevel") && workspace.getConfiguration().get("telemetry.telemetryLevel") === "off";
}
