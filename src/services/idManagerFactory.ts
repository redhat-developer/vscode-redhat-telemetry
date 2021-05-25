import { IdManager } from '../interfaces/idManager';
import { CheIdManager } from '../che/cheIdManager';
import { FileSystemIdManager } from './fileSystemIdManager';

export namespace IdManagerFactory {

    export function getIdManager(): IdManager {
        if (process.env['CHE_WORKSPACE_ID']) {
            return new CheIdManager();
        }
        return new FileSystemIdManager();
    }

}