import * as vscode from "vscode";
import { clientExtensionName } from "./setExtensionName";
import { checkVscodeCommonsStatus } from "./checkStatus";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name?: string;
  properties?: any;
  measures?: any;
}

export namespace Telemetry {
  export function send(event: TelemetryEvent) {
    checkVscodeCommonsStatus().then(
      (vscodeCommons: vscode.Extension<any> | undefined) => {
        const extensionIdentifier = clientExtensionName;
        const vscodeCommonsAPI = vscodeCommons?.exports;
        const telemetryService = vscodeCommonsAPI.getTelemetryService(
          extensionIdentifier
        );
        //   context.subscriptions.push(telemetryService);

        telemetryService.send({ ...event });
      }
    );
  }
}
