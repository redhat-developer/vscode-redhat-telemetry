import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { v4, v5 } from 'uuid';
import { Logger } from './logger';

let REDHAT_ANONYMOUS_UUID: string | undefined;
const REDHAT_NAMESPACE_UUID = '44662bc6-c388-4e0e-a652-53bda6f35923';

export namespace UUID {
  export function getRedHatUUID(redhatDir?: string): string {
    if (REDHAT_ANONYMOUS_UUID) {
      return REDHAT_ANONYMOUS_UUID;
    }
    const redhatUUIDFilePath = getAnonymousIdFile(redhatDir);
    try {
      REDHAT_ANONYMOUS_UUID = readFile(redhatUUIDFilePath);
      if (REDHAT_ANONYMOUS_UUID) {
        Logger.log(`loaded Red Hat UUID: ${REDHAT_ANONYMOUS_UUID}`);
      } else {
        Logger.log('No Red Hat UUID found');
        REDHAT_ANONYMOUS_UUID = v4();
        writeFile(redhatUUIDFilePath, REDHAT_ANONYMOUS_UUID);
        Logger.log(`Written Red Hat UUID: ${REDHAT_ANONYMOUS_UUID} to ${redhatUUIDFilePath}`);
      }
    } catch (e: any) {
      Logger.log('Failed to access Red Hat UUID: ' + e?.message);
    }
    return REDHAT_ANONYMOUS_UUID!;
  }

  export function getAnonymousIdFile(redhatDir?: string): string {
    const homedir = os.homedir();
    if (!redhatDir) {
      redhatDir = path.join(homedir, '.redhat');
    }
    return path.join(redhatDir, 'anonymousId');
  }

  export function readFile(filePath: string): string|undefined {
    let content: string | undefined;
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, { encoding: 'utf8' });
      if (content) {
        content = content.trim();
      }
    }
    return content;
  }

  export function writeFile(filePath: string, content: string){
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  }

  export function generateUUID(source: string): string {
    return v5(source, REDHAT_NAMESPACE_UUID);
  }
}
