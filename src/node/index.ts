import { ExtensionContext } from "vscode";
import { RedHatService } from "../common/api/redhatService"
import { TelemetryService, TelemetryEvent } from "../common/api/telemetry";
import { RedHatServiceNodeProvider } from "./redHatServiceNodeProvider";
import { IdProvider } from "../common/api/idProvider";

export { RedHatService, TelemetryService, TelemetryEvent, IdProvider };

export function getRedHatService(extension: ExtensionContext): Promise<RedHatService> {
  const provider = new RedHatServiceNodeProvider(extension);
  return provider.getRedHatService();
}