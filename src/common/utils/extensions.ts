import path from "path";
import { ExtensionContext } from "vscode";
import { readFile } from "../vscode/fsUtils";
import { DEFAULT_SEGMENT_DEBUG_KEY, DEFAULT_SEGMENT_KEY } from '../impl/constants';

export async function getExtension(context: ExtensionContext): Promise<ExtensionInfo> {
    if (context.extension) {
        return context.extension;
    }
    //When running in older vscode versions:
    const packageJson = await loadPackageJson(context.extensionPath);
    const info = {
        id: getExtensionId(packageJson),
        packageJSON: packageJson
    };
    return info;
}

export function getExtensionId(packageJson: any): string {
    return `${packageJson.publisher}.${packageJson.name}`;
}

export async function loadPackageJson(extensionPath: string): Promise<any> {
    const packageJsonPath = path.resolve(extensionPath, 'package.json')
    const rawdata = await readFile(packageJsonPath);
    const packageJson = JSON.parse(rawdata);
    return packageJson;
}

export interface ExtensionInfo {
    id: string,
    packageJSON: any
}

export function getPackageJson(extension: ExtensionInfo): any {
    const packageJson = extension.packageJSON;
    if (!packageJson.segmentWriteKey) {
        packageJson.segmentWriteKey = DEFAULT_SEGMENT_KEY;
    }
    if (!packageJson.segmentWriteKeyDebug) {
        packageJson.segmentWriteKeyDebug = DEFAULT_SEGMENT_DEBUG_KEY;
    }
    return packageJson;
}
