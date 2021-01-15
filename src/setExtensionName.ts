export let clientExtensionName = "";

export async function setExtensionName(extensionName: string) {
  if (extensionName) {
    clientExtensionName = extensionName;
  }
}
