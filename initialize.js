/* 

 * @since 1.0.3
 * @category Function
 * @param {} func The function to delay.
 * @returns {boolean} vscodeCommonsIsAlive status.

*/

export function Initialize() {
    const vscodeCommons = vscode.extensions.getExtension(
        "redhat.vscode-commons"
      );
    let vscodeCommonsIsAlive = false;
    if (vscodeCommons?.isActive) {
        console.log("alice: redhat.vscode-commons is active");
        vscodeCommonsIsAlive = true;
    } else {
        console.log("alice: redhat.vscode-commons is not active");
        await vscodeCommons?.activate().then(
            function () {
                console.log("alice: redhat.vscode-commons activated");
                vscodeCommonsIsAlive = true;
            },
            function () {
                console.log("alice: redhat.vscode-commons activation failed");
            }
        );
    }
  return vscodeCommonsIsAlive
}