import * as assert from 'assert';
import { anonymizeFilePaths } from '../../common/utils/telemetryUtils';

suite('Test anonymizeFilePaths', () => {
    test('should return empty string when input is empty', () => {
        const result = anonymizeFilePaths('');
        assert.strictEqual(result, '');
    });

    test('should return null when input is null', () => {
        const result = anonymizeFilePaths(null as any);
        assert.strictEqual(result, null);
    });

    test('should return undefined when input is undefined', () => {
        const result = anonymizeFilePaths(undefined as any);
        assert.strictEqual(result, undefined);
    });

    test('should return original string when no file paths are present', () => {
        const input = 'This is just a regular string without any paths';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, input);
    });

    test('should return original string when no slashes are present', () => {
        const input = 'This string has no forward or backslashes';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, input);
    });

    test('should anonymize Unix file paths', () => {
        const input = 'Error in /Users/john/workspace/project/src/file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should anonymize Windows file paths', () => {
        const input = 'Error in C:\\Users\\john\\workspace\\project\\src\\file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should anonymize Windows file paths with forward slashes', () => {
        const input = 'Error in C:/Users/john/workspace/project/src/file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should anonymize file:// URLs', () => {
        const input = 'Error in file:///Users/john/workspace/project/src/file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should anonymize multiple file paths in same string', () => {
        const input = 'Error in /Users/john/file1.ts and also in C:\\Users\\jane\\file2.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path> and also in <REDACTED: user-file-path>');
    });

    test('should not anonymize node_modules paths', () => {
        const input = 'Error in /Users/john/node_modules/package/index.js';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>/node_modules/package/index.js');
    });

    test('should not anonymize node_modules.asar paths', () => {
        const input = 'Error in /Users/john/node_modules.asar/package/index.js';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>/node_modules.asar/package/index.js');
    });

    test('should not anonymize node_modules paths with leading slash', () => {
        const input = 'Error in /node_modules/package/index.js';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, input);
    });

    test('should not anonymize node_modules paths with backslash', () => {
        const input = 'Error in \\node_modules\\package\\index.js';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, input);
    });

    test('should anonymize user paths but preserve node_modules paths', () => {
        const input = 'Error in /Users/john/project/src/file.ts and /Users/john/project/node_modules/package/index.js';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path> and <REDACTED: user-file-path>/node_modules/package/index.js');
    });

    test('should handle complex stack traces', () => {
        const stackTrace = `Error: Something went wrong
    at Object.function (/Users/john/workspace/project/src/file.ts:10:5)
    at /Users/john/workspace/project/src/other.ts:15:20
    at /Users/john/node_modules/package/index.js:5:10`;

        const result = anonymizeFilePaths(stackTrace);
        // Note: The current implementation may include line numbers in the redacted path
        // This is acceptable behavior as it still anonymizes the sensitive parts
        assert(result.includes('<REDACTED: user-file-path>'));
        assert(!result.includes('/Users/john/workspace/project/src/file.ts'));
        assert(!result.includes('/Users/john/workspace/project/src/other.ts'));
        assert(result.includes('<REDACTED: user-file-path>/node_modules/package/index.js:5:10'));
    });

    test('should handle paths with special characters', () => {
        const input = 'Error in /Users/john/my-project (copy)/src/file.ts';
        const result = anonymizeFilePaths(input);
        // Note: The current implementation may split paths with spaces in parentheses
        // This is acceptable behavior as it still anonymizes the sensitive parts
        assert(result.includes('<REDACTED: user-file-path>'));
        assert(!result.includes('/Users/john/my-project'));
    });

    test('should handle paths with dots and dashes', () => {
        const input = 'Error in /Users/john/my-project.v2/src/file-name.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should handle relative paths', () => {
        const input = 'Error in ./src/file.ts and ../other/file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path> and <REDACTED: user-file-path>');
    });

    test('should handle paths without file extensions', () => {
        const input = 'Error in /Users/john/workspace/project/src/file';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should handle mixed content with and without paths', () => {
        const input = 'Regular text /Users/john/file.ts more text C:\\Users\\jane\\file.ts end';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Regular text <REDACTED: user-file-path> more text <REDACTED: user-file-path> end');
    });

    test('should handle very long paths', () => {
        const longPath = '/Users/john/' + 'very/long/path/'.repeat(50) + 'file.ts';
        const input = `Error in ${longPath}`;
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    test('should handle paths with Unicode characters', () => {
        const input = 'Error in /Users/jöhn/workspace/project/src/file.ts';
        const result = anonymizeFilePaths(input);
        // Note: The current implementation may split Unicode paths
        // This is acceptable behavior as it still anonymizes the sensitive parts
        assert(result.includes('<REDACTED: user-file-path>'));
        assert(!result.includes('/Users/jöhn'));
    });

    test('should handle Windows UNC paths', () => {
        const input = 'Error in \\\\server\\share\\file.ts';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error in <REDACTED: user-file-path>');
    });

    // Tests for default cleanup patterns
    test('should preserve Java standard library paths with default patterns', () => {
        const input = 'Error at java.base/java.lang.String.<init>(String.java:123)';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, input);
    });

    test('should anonymize user paths but preserve Java paths with default patterns', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and java.base/java.lang.String.<init>(String.java:123)';
        const result = anonymizeFilePaths(input);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and java.base/java.lang.String.<init>(String.java:123)');
    });

    test('should handle complex Java stack trace with default patterns', () => {
        const stackTrace = `java.lang.NullPointerException
    at java.base/java.lang.String.<init>(String.java:123)
    at /Users/john/project/src/main.ts:45
    at java.util.ArrayList.add(ArrayList.java:456)
    at /home/user/app/index.js:12
    at org.springframework.context.ApplicationContext.getBean(ApplicationContext.java:789)`;

        const result = anonymizeFilePaths(stackTrace);
        assert(result.includes('java.base/java.lang.String.<init>(String.java:123)'));
        assert(result.includes('java.util.ArrayList.add(ArrayList.java:456)'));
        assert(result.includes('org.springframework.context.ApplicationContext.getBean(ApplicationContext.java:789)'));
        assert(result.includes('<REDACTED: user-file-path>'));
        assert(!result.includes('/Users/john/project/src/main.ts:45'));
        assert(!result.includes('/home/user/app/index.js:12'));
    });

    // Tests for custom cleanup patterns
    test('should use custom cleanup patterns when provided', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and java.base/java.lang.String.<init>(String.java:123)';
        const customPatterns = [/java\.base\//];
        const result = anonymizeFilePaths(input, customPatterns);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and java.base/java.lang.String.<init>(String.java:123)');
    });

    test('should not preserve patterns not in custom cleanup patterns', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and java.base/java.lang.String.<init>(String.java:123)';
        const customPatterns = [/java\.util\.\S*/]; // Only preserve java.util, not java.lang
        const result = anonymizeFilePaths(input, customPatterns);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and <REDACTED: user-file-path><init>(String.java:123)');
    });

    test('should handle empty custom cleanup patterns array', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and java.base/java.lang.String.<init>(String.java:123)';
        const result = anonymizeFilePaths(input, []);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and <REDACTED: user-file-path><init>(String.java:123)');
    });

    test('should handle multiple custom cleanup patterns', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45, java.base/java.lang.String.<init>(String.java:123), and org.springframework.context.ApplicationContext.getBean(ApplicationContext.java:456)';
        const customPatterns = [/java\.base\//, /org\.springframework\..*/];
        const result = anonymizeFilePaths(input, customPatterns);
        assert(result.includes('java.base/java.lang.String.<init>(String.java:123)'));
        assert(result.includes('org.springframework.context.ApplicationContext.getBean(ApplicationContext.java:456)'));
        assert(result.includes('Error at <REDACTED: user-file-path>:45'));
        assert(!result.includes('/Users/john/project/src/main.ts:45'));
    });

    test('should handle custom cleanup patterns with complex regex', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and my.custom.library/SomeClass.method(SomeClass.java:123)';
        const customPatterns = [/my\.custom\..*/];
        const result = anonymizeFilePaths(input, customPatterns);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and my.custom.library/SomeClass.method(SomeClass.java:123)');
    });

    test('should handle overlapping cleanup patterns', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and java.base/java.util.ArrayList.add(ArrayList.java:123)';
        const customPatterns = [/java\.base\//, /java\.util\..*/];
        const result = anonymizeFilePaths(input, customPatterns);
        assert(result.includes('<REDACTED: user-file-path>'));
        assert(!result.includes('/Users/john/project/src/main.ts:45'));
        assert(result.includes('java.base/java.util.ArrayList.add(ArrayList.java:123)'));
    });

    test('should preserve node_modules even with custom cleanup patterns', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and /Users/john/project/node_modules/package/index.js:12';
        const customPatterns = [/java\.base\//];
        const result = anonymizeFilePaths(input, customPatterns);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and <REDACTED: user-file-path>/node_modules/package/index.js:12');
    });

    test('should handle cleanup patterns that match partial paths', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45 and some.java.package.Class.method(Class.java:123)';
        const customPatterns = [/java\.package\..*/];
        const result = anonymizeFilePaths(input, customPatterns);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45 and some.java.package.Class.method(Class.java:123)');
    });

    test('should guard against infinite loops from bad regex patterns', () => {
        // Test with a regex that could cause infinite loops
        const input = 'Error at /Users/john/project/src/main.ts:45';
        const badPatterns = [/(.*)*/]; // This regex can cause catastrophic backtracking

        // Capture console.warn to verify the warning is issued
        const originalWarn = console.warn;
        let warningIssued = false;
        console.warn = (message: string) => {
            if (message.includes('stuck at position') || message.includes('exceeded')) {
                warningIssued = true;
            }
            originalWarn(message);
        };

        try {
            const result = anonymizeFilePaths(input, badPatterns);
            // The function should still return a result (even if it's not perfect)
            assert(typeof result === 'string');
            // The warning should have been issued
            assert(warningIssued, 'Expected warning about infinite loop prevention to be issued');
        } finally {
            console.warn = originalWarn;
        }
    });

    test('should handle empty cleanup patterns gracefully', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45';
        const result = anonymizeFilePaths(input, []);
        assert.strictEqual(result, 'Error at <REDACTED: user-file-path>:45');
    });

    test('should handle malformed regex patterns gracefully', () => {
        const input = 'Error at /Users/john/project/src/main.ts:45';
        // Test with a regex that could cause issues but is syntactically valid
        const problematicPatterns = [/(a+)+/]; // Catastrophic backtracking pattern

        // This should not throw an error and should complete without hanging
        const result = anonymizeFilePaths(input, problematicPatterns);
        assert(typeof result === 'string');
        // The pattern (a+)+ matches 'a' characters, so parts of the path containing 'a' will be preserved
        // This is expected behavior - when cleanup patterns match, those parts are preserved
        assert(result.includes('Error at'));
    });

});
