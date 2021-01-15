import * as vscode from "vscode";
import { clientExtensionName } from "./setExtensionName";
import { checkVscodeCommonsStatus } from "./checkStatus";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name: string;
  properties?: any;
  measures?: any;
  traits?: any;
}

let telemetryServiceInstance: any = null;
export namespace Telemetry {
  export function send(event: TelemetryEvent) {
    const telemetryService = getTelemetryService();
    //   context.subscriptions.push(telemetryService);

    telemetryService.send({ ...event });
  }

  function getTelemetryService() {
    if (telemetryServiceInstance) {
      console.log("vscode-tele: inside telemetryServiceInstance");

      checkVscodeCommonsStatus().then(
        (vscodeCommons: vscode.Extension<any> | undefined) => {
          const extensionIdentifier = clientExtensionName;
          const vscodeCommonsAPI = vscodeCommons?.exports;
          telemetryServiceInstance = vscodeCommonsAPI.getTelemetryService(
            extensionIdentifier
          );
        }
      );
    }
    return telemetryServiceInstance;
  }
}
