import path from "path";
import * as fs from 'fs';

export function getExtensionId(packageJson: any): string {
    return `${packageJson.publisher}.${packageJson.name}`;
}

export function loadPackageJson(extensionPath: string): any {
    const packageJsonPath = path.resolve(extensionPath, 'package.json')
    const rawdata = fs.readFileSync(packageJsonPath, { encoding: 'utf8' });
    const packageJson = JSON.parse(rawdata);
    return packageJson;
}