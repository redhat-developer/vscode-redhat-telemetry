import { IdManager } from '../interfaces/idManager';
import { CheIdManager } from '../che/cheIdManager';
import { FileSystemIdManager } from './fileSystemIdManager';
import { GitpodIdManager } from '../gitpod/gitpodIdManager';

export namespace IdManagerFactory {

    export function getIdManager(): IdManager {
        if (process.env['CHE_WORKSPACE_ID']) {
            return new CheIdManager();
        } else if (process.env['GITPOD_GIT_USER_EMAIL']) {
            return new GitpodIdManager();
        }
        return new FileSystemIdManager();
    }

}