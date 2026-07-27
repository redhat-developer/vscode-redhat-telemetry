import type { IdProvider } from '../common/api/idProvider';
import env from '../common/envVar';
import { CheIdProvider } from './cloud/cheIdProvider';
import { GitpodIdProvider } from './cloud/gitpodIdProvider';
import { FileSystemIdProvider } from './fileSystemIdManager';

export namespace IdManagerFactory {
  export function getIdManager(): IdProvider {
    const fsIdManager = new FileSystemIdProvider();
    if (env.CHE_WORKSPACE_ID) {
      return new CheIdProvider(fsIdManager);
    } else if (env.GITPOD_GIT_USER_EMAIL) {
      return new GitpodIdProvider(fsIdManager);
    }
    return fsIdManager;
  }
}
