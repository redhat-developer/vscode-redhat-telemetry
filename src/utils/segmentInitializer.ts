import { Logger } from './logger';
import Analytics from 'analytics-node';
import { getExtensionId } from './extensions';

const IS_DEBUG = startedInDebugMode();

let DEFAULT_SEGMENT_KEY: string | undefined;

export namespace SegmentInitializer {
  
  export function initialize(clientPackageJson: any): Analytics | undefined {
    let segmentWriteKey = getSegmentKey(clientPackageJson);
    if (!segmentWriteKey) {
      //Using the default key
      if (!DEFAULT_SEGMENT_KEY) {
        const defaultPackageJson = require('../../package.json');
        DEFAULT_SEGMENT_KEY = getSegmentKey(defaultPackageJson);
      }
      segmentWriteKey = DEFAULT_SEGMENT_KEY;
    }

    if (segmentWriteKey) {
      /* 
        flushAt: Number ->  The number of messages to enqueue before flushing.
        flushInterval: Number ->    The number of milliseconds to wait before flushing the queue automatically.
        ref: https://segment.com/docs/connections/sources/catalog/libraries/server/node/#configuration
        */
      let analytics: Analytics = new Analytics(segmentWriteKey, {
        flushAt: 10,
        flushInterval: 10000,
      });
      return analytics;
    } else {
      Logger.log('Missing segmentWriteKey from package.json OR package.json in vscode-commons');
      return undefined;
    }
  }
}

function startedInDebugMode(): boolean {
  const args = (process as any).execArgv as string[];
  return hasDebugFlag(args);
}

// exported for tests
function hasDebugFlag(args: string[]): boolean {
  if (args) {
    // See https://nodejs.org/en/docs/guides/debugging-getting-started/
    return args.some(arg => /^--inspect/.test(arg) || /^--debug/.test(arg));
  }
  return false;
}

function getSegmentKey(packageJson: any): string | undefined {
  const extensionId = getExtensionId(packageJson);
  let keyKey = 'segmentWriteKeyDebug';
  try {
    let clientSegmentKey: string | undefined = undefined;
    if (IS_DEBUG) {
      clientSegmentKey = packageJson[keyKey];
    } else {
      keyKey = 'segmentWriteKey';
      clientSegmentKey = packageJson[keyKey];
    }
    if (clientSegmentKey) {
      Logger.log(`'${extensionId}' ${keyKey} : ${clientSegmentKey}`);
    }
    return clientSegmentKey;
  } catch (error) {
    Logger.log(`Unable to get '${extensionId}' ${keyKey}: ${error}`);
  }
  return undefined;
}
