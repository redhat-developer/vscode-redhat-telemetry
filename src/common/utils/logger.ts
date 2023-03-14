import envVars from "../envVar";

export let doLog: boolean = envVars.VSCODE_REDHAT_TELEMETRY_DEBUG === 'true';

// This exists only for testing purposes. Could delete later.
const VERSION = require('../../../package.json').version;


export namespace Logger {
  export let extId = 'unknown';
  export function log(s: number | string | boolean | undefined): void {
    if (doLog) {
      console.log(`vscode-redhat-telemetry ${VERSION} (${extId}): ${s}`);
    }
  }
  export function info(s: number | string | boolean | undefined): void {
    console.info(`vscode-redhat-telemetry ${VERSION} (${extId}): ${s}`);
  }
}
