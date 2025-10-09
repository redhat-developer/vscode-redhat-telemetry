/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Copied/adapted from https://github.com/microsoft/vscode/blob/6115140fb0657d86350c2de8bcf53e61c731d8cd/src/vs/platform/telemetry/common/telemetryUtils.ts

// Regex patterns for path sanitization
const NODE_MODULES_REGEX = /[\\\/]?(node_modules|node_modules\.asar)[\\\/]/;
const FILE_REGEX_PATTERN = /(file:\/\/)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._]+(\\\\|\\|\/))+[\w-\._]+/g;

/**
 * Cleans a given stack of possible paths
 * @param stack The stack to sanitize
 * @param cleanupPatterns Cleanup patterns to remove from the stack
 * @returns The cleaned stack
 */
export function anonymizeFilePaths(stack: string): string {

    // Fast check to see if it is a file path to avoid doing unnecessary heavy regex work
    if (!stack || (!stack.includes('/') && !stack.includes('\\'))) {
        return stack;
    }

    // Create a new regex instance for this function call to avoid lastIndex mutation issues
    const fileRegex = new RegExp(FILE_REGEX_PATTERN);
    let updatedStack = '';
    let lastIndex = 0;

    while (true) {
        const result = fileRegex.exec(stack);
        if (!result) {
            break;
        }

        // Check if this is a node_modules path
        const isNodeModules = NODE_MODULES_REGEX.test(result[0]);

        // anoynimize user file paths that do not need to be retained or cleaned up.
        if (!isNodeModules) {
            updatedStack += stack.substring(lastIndex, result.index) + '<REDACTED: user-file-path>';
        } else {
            // For node_modules paths, anonymize the user part but preserve the node_modules part
            const match = result[0];
            const nodeModulesMatch = match.match(NODE_MODULES_REGEX);
            if (nodeModulesMatch) {
                const nodeModulesIndex = match.indexOf(nodeModulesMatch[0]);
                // If the path starts with node_modules (no user part), preserve the entire path
                if (nodeModulesIndex === 0) {
                    updatedStack += stack.substring(lastIndex, fileRegex.lastIndex);
                } else {
                    // Otherwise, anonymize the user part and preserve the node_modules part
                    const nodeModulesPart = match.substring(nodeModulesIndex);
                    updatedStack += stack.substring(lastIndex, result.index) + '<REDACTED: user-file-path>' + nodeModulesPart;
                }
            } else {
                // Fallback: preserve the original text
                updatedStack += stack.substring(lastIndex, fileRegex.lastIndex);
            }
        }
        lastIndex = fileRegex.lastIndex;
    }
    if (lastIndex < stack.length) {
        updatedStack += stack.substring(lastIndex);
    }

    return updatedStack;
}