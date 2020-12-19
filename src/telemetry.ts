import { initialize } from "./initialize";
import * as vscode from "vscode";

interface TelemetryEvent {
  type?: string; // type of telemetry event such as : identify, track, page, etc.
  name?: string;
  properties?: any;
  measures?: any;
}

export namespace Telemetry {
  export function send(event: TelemetryEvent) {
    initialize().then((vscodeCommons: vscode.Extension<any> | undefined) => {
      const extensionIdentifier = "redhat.alice";
      const vscodeCommonsAPI = vscodeCommons?.exports;
      const telemetryService = vscodeCommonsAPI.getTelemetryService(
        extensionIdentifier
      );
      //   context.subscriptions.push(telemetryService);

      telemetryService.send({ ...event });
    });
  }
}
