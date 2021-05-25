import { workspace, WorkspaceConfiguration } from 'vscode';
import { TelemetrySettings } from '../interfaces/settings';
import { CONFIG_KEY } from './constants';

export class VSCodeSettings implements TelemetrySettings {
  isTelemetryEnabled(): boolean {
    return getTelemetryConfiguration().get<boolean>('enabled', false);
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
