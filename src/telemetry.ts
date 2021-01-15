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
let telemetryService: any;
let RedHatUUID: string;
export namespace Telemetry {
  export async function send(event: TelemetryEvent) {
    //   context.subscriptions.push(telemetryService);
    console.log("vscode-tele: inside telemetryServiceInstance");

    if (!checkVscodeCommonsStatus()) {
      await activateVscodeCommons();
    }
    telemetryService.send({ ...event });
  }

  export function setExtensionName(extensionName: string) {
    if (extensionName) {
      clientExtensionName = extensionName;
    }
  }

  export function getRedHatUUID(): string {
    return RedHatUUID;
  }

  async function activateVscodeCommons() {
    const vscodeCommons = vscode.extensions.getExtension(
      "redhat.vscode-commons"
    );
    await vscodeCommons?.activate().then(
      function () {
        console.log("vscode-tele: redhat.vscode-commons activated");
        const vscodeCommonsAPI = vscodeCommons?.exports;
        setTelemetryService(vscodeCommonsAPI);
        setLocalRedHatUUID(vscodeCommonsAPI);
      },
      function () {
        console.log("vscode-tele: redhat.vscode-commons activation failed");
      }
    );
  }
  async function setTelemetryService(vscodeCommonsAPI: any) {
    const extensionIdentifier = clientExtensionName;
    telemetryService = await vscodeCommonsAPI.getTelemetryService(
      extensionIdentifier
    );
  }

  async function setLocalRedHatUUID(vscodeCommonsAPI: any) {
    RedHatUUID = await vscodeCommonsAPI.getRedHatUUID();
  }
}
