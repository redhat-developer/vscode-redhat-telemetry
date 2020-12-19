import * as vscode from "vscode";

export async function initialize(): Promise<vscode.Extension<any> | undefined> {
  // To get an instance of "redhat.vscode-commons"
  const vscodeCommons = vscode.extensions.getExtension("redhat.vscode-commons");

  if (vscodeCommons?.isActive) {
    console.log("vscode-tele: redhat.vscode-commons is active");
  } else {
    console.log("vscode-tele: redhat.vscode-commons is not active");
    await vscodeCommons?.activate().then(
      function () {
        console.log("vscode-tele: redhat.vscode-commons activated");
      },
      function () {
        console.log("vscode-tele: redhat.vscode-commons activation failed");
      }
    );
  }
  return vscodeCommons;
}
