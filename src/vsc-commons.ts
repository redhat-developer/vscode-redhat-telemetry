import * as vscode from "vscode";
import { TelemetryService } from "./interfaces/telemetry";
import { Logger } from "./utils/logger";


let REDHAT_UUID: Promise<string>;
let vscodeCommonsAPI: any;

export async function getRedHatUUID() {
  if (!REDHAT_UUID) {
    await ensureVSCodeCommonsActive();
    REDHAT_UUID = await vscodeCommonsAPI?.getRedHatUUID()
  }
  return REDHAT_UUID;
}

export async function getTelemetryService(extensionId: String): Promise<TelemetryService> {
  if (!extensionId) {
    throw new Error(`clientExtensionId was not set!`);
  }
  await ensureVSCodeCommonsActive();
  return vscodeCommonsAPI?.getTelemetryService(extensionId) as TelemetryService;
}

async function ensureVSCodeCommonsActive() {
  if (vscodeCommonsAPI) {
    return;
  }
  const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons")
  if (vscodeCommons && !vscodeCommons.isActive) {
    await vscodeCommons.activate().then(
      function () {
        Logger.log('redhat.vscode-commons activated');
      },
      function () {
        Logger.log('redhat.vscode-commons activation failed');
      }
    );
  }
  vscodeCommonsAPI = vscodeCommons?.exports;
}
