export let doLog: boolean = (typeof process !== 'undefined')?process.env.VSCODE_REDHAT_TELEMETRY_DEBUG === 'true': false;

// This exists only for testing purposes. Could delete later.
export namespace Logger {
  export function log(s: number | string | boolean | undefined): void {
    if (doLog) {
      console.log('vscode-redhat-telemetry: ' + s);
    }
  }
}
