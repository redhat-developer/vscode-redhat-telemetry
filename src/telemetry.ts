import * as vscode from "vscode";
import { checkVscodeCommonsStatus } from "./checkStatus";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name: string;
  properties?: any;
  measures?: any;
  traits?: any;
}

let clientExtensionId = "";
let telemetryService: any;
let REDHAT_UUID: string;
let vscodeCommonsAPI: any;

export namespace Telemetry {
  export async function send(event: TelemetryEvent) {
    //   context.subscriptions.push(telemetryService);
    console.log("vscode-redhat-telemetry: inside telemetryServiceInstance");
    await ensureVSCodeCommonsActive();
    if (telemetryService) {
      telemetryService.send({ ...event });
    }
  }

  export function setExtension(extensionId: string) {
    if (extensionId) {
      clientExtensionId = extensionId;
    }
  }

  export async function getRedHatUUID() {
    if (!REDHAT_UUID) {
      await ensureVSCodeCommonsActive();
      REDHAT_UUID = await vscodeCommonsAPI.getRedHatUUID()
    }
    return REDHAT_UUID;
  }

  async function initializeTelemetryService(vscodeCommonsAPI: any) {
    if (vscodeCommonsAPI) {
      const extensionId = clientExtensionId;
      telemetryService = await vscodeCommonsAPI.getTelemetryService(extensionId);
    }
  }

  async function ensureVSCodeCommonsActive() {
    if (vscodeCommonsAPI) {
      return;
    }
    const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons")
    if (vscodeCommons && !vscodeCommons.isActive) {
      await vscodeCommons.activate().then(
        function () {
          console.log("vscode-redhat-telemetry: redhat.vscode-commons activated");
        },
        function () {
          console.log("vscode-redhat-telemetry: redhat.vscode-commons activation failed");
        }
      );
    }
    vscodeCommonsAPI = vscodeCommons?.exports;
    initializeTelemetryService(vscodeCommonsAPI);
  }
}
