import { ExtensionContext } from "vscode";
import { RedHatService } from "../common/api/redhatService"
import { TelemetryService, TelemetryEvent} from "../common/api/telemetry";
import { RedHatServiceWebWorkerProvider } from "./redHatServiceWebWorkerProvider";

export {RedHatService, TelemetryService, TelemetryEvent};

export function getRedHatService(extension: ExtensionContext): Promise<RedHatService> {
  const provider = new RedHatServiceWebWorkerProvider(extension);
  return provider.getRedHatService();
}