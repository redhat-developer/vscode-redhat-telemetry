import { IdProvider } from '../common/api/idProvider';
import { CheIdProvider } from './cloud/cheIdProvider'
import { GitpodIdProvider } from './cloud/gitpodIdProvider'
import { FileSystemIdProvider } from './fileSystemIdManager';
import env from '../common/envVar';

export namespace IdManagerFactory {

    export function getIdManager(): IdProvider {
        const fsIdManager = new FileSystemIdProvider();
        if (env['CHE_WORKSPACE_ID']) {
            return new CheIdProvider(fsIdManager);
        } else if (env['GITPOD_GIT_USER_EMAIL']) {
            return new GitpodIdProvider(fsIdManager);
        }
        return fsIdManager;
    }

}