import type { ExtensionContext } from 'vscode';
import type { IdProvider } from '../common/api/idProvider';
import type { RedHatService } from '../common/api/redhatService';
import type { TelemetryEvent, TelemetryService } from '../common/api/telemetry';
import { RedHatServiceNodeProvider } from './redHatServiceNodeProvider';

export type { IdProvider, RedHatService, TelemetryEvent, TelemetryService };

export function getRedHatService(extension: ExtensionContext): Promise<RedHatService> {
  const provider = new RedHatServiceNodeProvider(extension);
  return provider.getRedHatService();
}
