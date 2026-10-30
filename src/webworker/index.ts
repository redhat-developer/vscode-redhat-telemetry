import type { ExtensionContext } from 'vscode';
import type { RedHatService } from '../common/api/redhatService';
import type { TelemetryEvent, TelemetryService } from '../common/api/telemetry';
import type { TelemetryOptions } from '../common/api/telemetryOptions';
import { RedHatServiceWebWorkerProvider } from './redHatServiceWebWorkerProvider';

export type { RedHatService, TelemetryEvent, TelemetryOptions, TelemetryService };

export function getRedHatService(extension: ExtensionContext, options?: TelemetryOptions): Promise<RedHatService> {
  const provider = new RedHatServiceWebWorkerProvider(extension, options);
  return provider.getRedHatService();
}
