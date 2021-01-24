import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { v4, v5 } from 'uuid';
import { Logger } from './logger';

let REDHAT_ANONYMOUS_UUID: string | undefined;
const REDHAT_NAMESPACE_UUID = '44662bc6-c388-4e0e-a652-53bda6f35923';

export namespace UUID {
  export function getRedHatUUID(redhatDir?: string) {
    if (REDHAT_ANONYMOUS_UUID) {
      return REDHAT_ANONYMOUS_UUID;
    }

    const homedir = os.homedir();
    if (!redhatDir) {
      redhatDir = path.join(homedir, '.redhat');
    }
    const redhatUUIDFilePath = path.join(redhatDir, 'anonymousId');
    try {
      if (fs.existsSync(redhatUUIDFilePath)) {
        const contents = fs.readFileSync(redhatUUIDFilePath, { encoding: 'utf8' });
        if (contents) {
          REDHAT_ANONYMOUS_UUID = contents.trim();
        }
      }
      if (REDHAT_ANONYMOUS_UUID) {
        Logger.log(`loaded Red Hat UUID: ${REDHAT_ANONYMOUS_UUID}`);
      } else {
        Logger.log('No Red Hat UUID found');
        REDHAT_ANONYMOUS_UUID = v4();
        if (!fs.existsSync(redhatDir)) {
          fs.mkdirSync(redhatDir);
        }
        fs.writeFileSync(redhatUUIDFilePath, REDHAT_ANONYMOUS_UUID, { encoding: 'utf8' });
        Logger.log(`Written Red Hat UUID: ${REDHAT_ANONYMOUS_UUID} to ${redhatUUIDFilePath}`);
      }
    } catch (e) {
      Logger.log('Failed to access Red Hat UUID: ' + e.message);
    }
    return REDHAT_ANONYMOUS_UUID!;
  }

  export function generateUUID(source: string): string {
    return v5(source, REDHAT_NAMESPACE_UUID);
  }
}
