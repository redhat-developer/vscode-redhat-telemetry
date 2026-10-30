import type { ExtensionContext } from 'vscode';
import type { IdProvider } from '../common/api/idProvider';
import type { RedHatService } from '../common/api/redhatService';
import type { TelemetryEvent, TelemetryService } from '../common/api/telemetry';
import type { TelemetryOptions } from '../common/api/telemetryOptions';
import { RedHatServiceNodeProvider } from './redHatServiceNodeProvider';

export type { IdProvider, RedHatService, TelemetryEvent, TelemetryOptions, TelemetryService };

export function getRedHatService(extension: ExtensionContext, options?: TelemetryOptions): Promise<RedHatService> {
  const provider = new RedHatServiceNodeProvider(extension, options);
  return provider.getRedHatService();
}
