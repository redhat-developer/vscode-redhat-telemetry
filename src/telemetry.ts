import * as vscode from "vscode";
import { checkVscodeCommonsStatus } from "./checkStatus";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name: string;
  properties?: any;
  measures?: any;
  traits?: any;
}

let clientExtensionName = "";
export namespace Telemetry {
  export function send(event: TelemetryEvent) {
    //   context.subscriptions.push(telemetryService);
    console.log("vscode-tele: inside telemetryServiceInstance");

    checkVscodeCommonsStatus().then(
      async (vscodeCommons: vscode.Extension<any> | undefined) => {
        const extensionIdentifier = clientExtensionName;
        const vscodeCommonsAPI = vscodeCommons?.exports;
        const telemetryService = await vscodeCommonsAPI.getTelemetryService(
          extensionIdentifier
        );
        telemetryService.send({ ...event });
      }
    );
  }

  export function setExtensionName(extensionName: string) {
    if (extensionName) {
      clientExtensionName = extensionName;
    }
  }
}
