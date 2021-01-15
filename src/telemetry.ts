import * as vscode from "vscode";
import { checkVscodeCommonsStatus } from "./checkStatus";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name: string;
  properties?: any;
  measures?: any;
  traits?: any;
}

export namespace Telemetry {
  let telemetryServiceInstance: any = null;
  let clientExtensionName = "";

  export function send(event: TelemetryEvent) {
    const telemetryService = getTelemetryService();
    //   context.subscriptions.push(telemetryService);

    telemetryService.send({ ...event });
  }

  export function setExtensionName(extensionName: string) {
    if (extensionName) {
      clientExtensionName = extensionName;
    }
  }

  function getTelemetryService() {
    if (telemetryServiceInstance) {
      console.log("vscode-tele: inside telemetryServiceInstance");

      checkVscodeCommonsStatus().then(
        async (vscodeCommons: vscode.Extension<any> | undefined) => {
          const extensionIdentifier = clientExtensionName;
          const vscodeCommonsAPI = vscodeCommons?.exports;
          telemetryServiceInstance = await vscodeCommonsAPI.getTelemetryService(
            extensionIdentifier
          );
        }
      );
    }
    return telemetryServiceInstance;
  }
}
