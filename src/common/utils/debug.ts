function startedInDebugMode(): boolean {
  let args: string[] | undefined;
  if (!(typeof process === 'undefined')) {
    args = (process as any)?.execArgv as string[];
  }
  return hasDebugFlag(args);
}

// exported for tests
function hasDebugFlag(args?: string[]): boolean {
  if (args) {
    // See https://nodejs.org/en/docs/guides/debugging-getting-started/
    return args.some(arg => /^--inspect/.test(arg) || /^--debug/.test(arg));
  }
  return false;
}

const IS_DEBUG = startedInDebugMode();
export default IS_DEBUG;