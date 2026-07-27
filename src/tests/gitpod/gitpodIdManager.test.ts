import * as assert from 'node:assert';
import * as fs from 'node:fs';
import { afterEach, beforeEach, suite, test } from 'vitest';
import env from '../../common/envVar';
import { GitpodIdProvider } from '../../node/cloud/gitpodIdProvider';
import { FileSystemIdProvider } from '../../node/fileSystemIdManager';

const redhatDir = `${process.cwd()}/.redhat/`;

suite('Test gitpod Id manager', () => {
  beforeEach(() => {
    if (fs.existsSync(redhatDir)) {
      fs.rmSync(redhatDir, { recursive: true, force: true });
    }
  });
  afterEach(() => {
    if (fs.existsSync(redhatDir)) {
      fs.rmSync(redhatDir, { recursive: true, force: true });
    }
  });
  test('Should generate Red Hat UUID from GITPOD_GIT_USER_EMAIL env', async () => {
    env.GITPOD_GIT_USER_EMAIL = 'some.user@company.com';
    console.log(env.GITPOD_GIT_USER_EMAIL);
    const fsIdProvider = new FileSystemIdProvider(redhatDir);
    const gitpod = new GitpodIdProvider(fsIdProvider);
    const id = await gitpod.loadRedHatUUID();
    const expectedId = '465b7cd6-0f77-5fc8-97ed-7b6342df109f';
    assert.strictEqual(id, expectedId);

    //Check anonymousId file was updated
    const anonymousId = fsIdProvider.readFile(fsIdProvider.getAnonymousIdFile());
    assert.strictEqual(anonymousId, id);
  });
});
