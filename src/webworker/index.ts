import type { ExtensionContext } from 'vscode';
import type { RedHatService } from '../common/api/redhatService';
import type { TelemetryEvent, TelemetryService } from '../common/api/telemetry';
import { RedHatServiceWebWorkerProvider } from './redHatServiceWebWorkerProvider';

export type { RedHatService, TelemetryEvent, TelemetryService };

export function getRedHatService(extension: ExtensionContext): Promise<RedHatService> {
  const provider = new RedHatServiceWebWorkerProvider(extension);
  return provider.getRedHatService();
}
