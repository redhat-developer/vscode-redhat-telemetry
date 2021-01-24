export function getExtensionId(packageJson: any): string {
    return `${packageJson.publisher}.${packageJson.name}`;
}