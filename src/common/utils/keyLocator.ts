import { getExtensionId } from "./extensions";
import { Logger } from "./logger";
import debug from './debug';

let DEFAULT_SEGMENT_KEY: string | undefined;

export function getSegmentKey(clientPackageJson: any): string | undefined {
  let segmentWriteKey = readSegmentKey(clientPackageJson);
  if (!segmentWriteKey) {
    //Using the default key
    if (!DEFAULT_SEGMENT_KEY) {
      const defaultPackageJson = require('../../../package.json');
      DEFAULT_SEGMENT_KEY = readSegmentKey(defaultPackageJson);
    }
    segmentWriteKey = DEFAULT_SEGMENT_KEY;
  }
  return segmentWriteKey;
}

function readSegmentKey(packageJson: any): string | undefined {
  const extensionId = getExtensionId(packageJson);
  let keyKey = 'segmentWriteKeyDebug';
  try {
    let clientSegmentKey: string | undefined = undefined;
    if (debug) {
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