/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// Copied/adapted from https://github.com/microsoft/vscode/blob/6115140fb0657d86350c2de8bcf53e61c731d8cd/src/vs/platform/telemetry/common/telemetryUtils.ts

// Regex patterns for path sanitization
const NODE_MODULES_REGEX = /[\\\/]?(node_modules|node_modules\.asar)[\\\/]/;
const FILE_REGEX_PATTERN = /(file:\/\/?)?([a-zA-Z]:(\\\\|\\|\/)|(\\\\|\\|\/))?([\w-\._%]+(\\\\|\\|\/))+[\w-\._%]+/g;

// Default cleanup patterns to preserve common system/library paths
const DEFAULT_CLEANUP_PATTERNS: RegExp[] = [
    /java\.\S*/,          // Java standard library and related packages (any non-whitespace chars)
    /\/jdt\.ls-java-project\S*/, // Eclipse JDT Language Server Java project paths
];

/**
 * Cleans a given stack of possible paths
 * @param stack The stack to sanitize
 * @param cleanupPatterns Cleanup patterns to preserve (paths matching these patterns won't be anonymized).
 *                        If not provided, uses default patterns for common system/library paths.
 * @returns The cleaned stack
 */
export function anonymizeFilePaths(stack: string, cleanupPatterns: RegExp[] = DEFAULT_CLEANUP_PATTERNS): string {

    // Fast check to see if it is a file path to avoid doing unnecessary heavy regex work
    if (!stack || (!stack.includes('/') && !stack.includes('\\'))) {
        return stack;
    }

    // Process multiline strings line by line
    const lines = stack.split('\n');
    const processedLines = lines.map(line => anonymizeFilePathsInLine(line, cleanupPatterns));
    return processedLines.join('\n');
}

/**
 * Anonymizes file paths in a single line
 * @param line The line to sanitize
 * @param cleanupPatterns Cleanup patterns to preserve
 * @returns The cleaned line
 */
function anonymizeFilePathsInLine(line: string, cleanupPatterns: RegExp[]): string {
    // Fast check to see if it is a file path to avoid doing unnecessary heavy regex work
    if (!line || (!line.includes('/') && !line.includes('\\'))) {
        return line;
    }

    // Find all cleanup pattern matches and store their positions
    const cleanUpIndexes: [number, number][] = [];
    for (const regexp of cleanupPatterns) {
        try {
            // Create a new regex instance with global flag to avoid lastIndex mutation issues
            const pattern = new RegExp(regexp.source, regexp.flags + 'g');
            let match;
            let iterationCount = 0;
            const maxIterations = 300;
            const patternMatches: [number, number][] = [];
            let patternFailed = false;

            while ((match = pattern.exec(line)) !== null) {
                // Guard against infinite loops from bad regex patterns
                if (++iterationCount > maxIterations) {
                    console.warn(`Warning: Cleanup pattern ${regexp.source} exceeded ${maxIterations} iterations, breaking to prevent infinite loop`);
                    patternFailed = true;
                    break;
                }

                // Additional guard: if we're stuck at the same position, break
                if (iterationCount > 1 && match.index === patternMatches[patternMatches.length - 1]?.[0]) {
                    console.warn(`Warning: Cleanup pattern ${regexp.source} is stuck at position ${match.index}, breaking to prevent infinite loop`);
                    patternFailed = true;
                    break;
                }

                patternMatches.push([match.index, pattern.lastIndex]);
            }

            // Only add matches if the pattern completed successfully (didn't fail due to infinite loop protection)
            if (!patternFailed) {
                cleanUpIndexes.push(...patternMatches);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.warn(`Warning: Invalid cleanup pattern ${regexp.source}: ${errorMessage}`);
            // Continue with other patterns
        }
    }

    // Create a new regex instance for this function call to avoid lastIndex mutation issues
    const fileRegex = new RegExp(FILE_REGEX_PATTERN);
    let lastIndex = 0;
    let updatedLine = '';
    let filePathIterationCount = 0;
    const maxFilePathIterations = 300;

    while (true) {
        const result = fileRegex.exec(line);
        if (!result) {
            break;
        }

        // Guard against infinite loops from bad regex patterns
        if (++filePathIterationCount > maxFilePathIterations) {
            console.warn(`Warning: File path regex exceeded ${maxFilePathIterations} iterations, breaking to prevent infinite loop`);
            break;
        }

        // Check if any cleanup pattern matches overlap with this file path match
        const overlappingRange = cleanUpIndexes.some(([start, end]) =>
            result.index < end && start < fileRegex.lastIndex
        );

        // Check if this is a node_modules path
        const isNodeModules = NODE_MODULES_REGEX.test(result[0]);

        // Preserve paths that match cleanup patterns or are node_modules
        if (overlappingRange || isNodeModules) {
            if (isNodeModules) {
                // For node_modules paths, anonymize the user part but preserve the node_modules part
                const match = result[0];
                const nodeModulesMatch = match.match(NODE_MODULES_REGEX);
                if (nodeModulesMatch) {
                    const nodeModulesIndex = match.indexOf(nodeModulesMatch[0]);
                    // If the path starts with node_modules (no user part), preserve the entire path
                    if (nodeModulesIndex === 0) {
                        updatedLine += line.substring(lastIndex, fileRegex.lastIndex);
                    } else {
                        // Otherwise, anonymize the user part and preserve the node_modules part
                        const nodeModulesPart = match.substring(nodeModulesIndex);
                        updatedLine += line.substring(lastIndex, result.index) + '<REDACTED: user-file-path>' + nodeModulesPart;
                    }
                } else {
                    // Fallback: preserve the original text
                    updatedLine += line.substring(lastIndex, fileRegex.lastIndex);
                }
            } else {
                // For cleanup pattern matches, preserve the entire path
                updatedLine += line.substring(lastIndex, fileRegex.lastIndex);
            }
        } else {
            // Anonymize user file paths that don't match cleanup patterns or node_modules
            updatedLine += line.substring(lastIndex, result.index) + '<REDACTED: user-file-path>';
        }
        lastIndex = fileRegex.lastIndex;
    }
    if (lastIndex < line.length) {
        updatedLine += line.substring(lastIndex);
    }

    return updatedLine;
}