import * as vscode from "vscode";
export function checkVscodeCommonsStatus(): boolean {
  // To get an instance of "redhat.vscode-commons"
  const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons");
  // To get segmentKey of client extension
  if (vscodeCommons?.isActive) {
    console.log("vscode-tele: redhat.vscode-commons is active");
    return true;
  } else {
    console.log("vscode-tele: redhat.vscode-commons is not active");
    return false;
  }
}
