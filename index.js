const initialize = require("./initialize");
// function initialize() {
//     const vscodeCommons = vscode.extensions.getExtension(
//         "redhat.vscode-commons"
//       );
//     let vscodeCommonsIsAlive = false;
//     if (vscodeCommons?.isActive) {
//         console.log("alice: redhat.vscode-commons is active");
//         vscodeCommonsIsAlive = true;
//     } else {
//         console.log("alice: redhat.vscode-commons is not active");
//         await vscodeCommons?.activate().then(
//             function () {
//                 console.log("alice: redhat.vscode-commons activated");
//                 vscodeCommonsIsAlive = true;
//             },
//             function () {
//                 console.log("alice: redhat.vscode-commons activation failed");
//             }
//         );
//     }
//   return vscodeCommonsIsAlive
// }

// function getTelemetryService(extensionIdentifier){
//     const vscodeCommonsAPI = vscodeCommons?.exports;
//     const telemetryService = vscodeCommonsAPI.getTelemetryService(
//         extensionIdentifier
//       );
//     //   context.subscriptions.push(telemetryService);
//       return telemetryService;
// }
