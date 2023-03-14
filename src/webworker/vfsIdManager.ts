import { IdProvider } from "../common/api/idProvider";

import * as path from 'path';
import { Logger } from '../common/utils/logger';
import { generateUUID } from "../common/utils/uuid";
import { FileSystemStorageService } from "../common/vscode/fileSystemStorageService";

let REDHAT_ANONYMOUS_UUID: string | undefined;

/**
* Service providing the Red Hat anonymous user id, read/stored from the `~/.redhat/anonymousId` file. 
*/
export class VFSSystemIdProvider implements IdProvider {
  
  constructor(private storageService: FileSystemStorageService){}

  public async getRedHatUUID(): Promise<string> {
    if (REDHAT_ANONYMOUS_UUID) {
      return REDHAT_ANONYMOUS_UUID;
    }
    const redhatUUIDFilePath = this.getAnonymousIdFile();
    try {
      REDHAT_ANONYMOUS_UUID = await this.storageService.readFromFile(redhatUUIDFilePath);
      if (REDHAT_ANONYMOUS_UUID) {
        Logger.log(`loaded Red Hat UUID: ${REDHAT_ANONYMOUS_UUID}`);
      } else {
        Logger.log('No Red Hat UUID found');
        REDHAT_ANONYMOUS_UUID = generateUUID();
        await this.storageService.writeToFile(redhatUUIDFilePath, REDHAT_ANONYMOUS_UUID);
        Logger.log(`Written Red Hat UUID: ${REDHAT_ANONYMOUS_UUID} to ${redhatUUIDFilePath}`);
      }
    } catch (e: any) {
      Logger.log('VFSSystemIdProvider failed to access Red Hat UUID: ' + e?.message);
    }
    return REDHAT_ANONYMOUS_UUID!;
  }

  public getAnonymousIdFile(): string {
    return path.join('.redhat', 'anonymousId');
  }

}