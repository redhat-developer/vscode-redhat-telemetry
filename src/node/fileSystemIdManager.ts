import { IdProvider } from "../common/api/idProvider";

import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '../common/utils/logger';
import { generateUUID } from "../common/utils/uuid";

let REDHAT_ANONYMOUS_UUID: string | undefined;

/**
* Service providing the Red Hat anonymous user id, read/stored from the `~/.redhat/anonymousId` file. 
*/
export class FileSystemIdProvider implements IdProvider {

  constructor(private redhatDir?: string) { }

  async getRedHatUUID(): Promise<string> {
    return this.loadRedHatUUID();
  }

  public loadRedHatUUID(uuidGenerator?: (source?: string) => string): string {
    if (REDHAT_ANONYMOUS_UUID) {
      return REDHAT_ANONYMOUS_UUID;
    }
    const redhatUUIDFilePath = this.getAnonymousIdFile();
    try {
      REDHAT_ANONYMOUS_UUID = this.readFile(redhatUUIDFilePath);
      if (REDHAT_ANONYMOUS_UUID) {
        Logger.log(`loaded Red Hat UUID: ${REDHAT_ANONYMOUS_UUID}`);
      } else {
        Logger.log('No Red Hat UUID found');
        REDHAT_ANONYMOUS_UUID = uuidGenerator ? uuidGenerator() : generateUUID();
        this.writeFile(redhatUUIDFilePath, REDHAT_ANONYMOUS_UUID);
        Logger.log(`Written Red Hat UUID: ${REDHAT_ANONYMOUS_UUID} to ${redhatUUIDFilePath}`);
      }
    } catch (e: any) {
      Logger.log('Failed to access Red Hat UUID: ' + e?.message);
    }
    return REDHAT_ANONYMOUS_UUID!;
  }

  public getAnonymousIdFile(): string {
    const homedir = os.homedir();
    if (!this.redhatDir) {
      this.redhatDir = path.join(homedir, '.redhat');
    }
    return path.join(this.redhatDir, 'anonymousId');
  }

  public readFile(filePath: string): string | undefined {
    let content: string | undefined;
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, { encoding: 'utf8' });
      if (content) {
        content = content.trim();
      }
    }
    return content;
  }

  public writeFile(filePath: string, content: string) {
    const parentDir = path.dirname(filePath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
  }

}