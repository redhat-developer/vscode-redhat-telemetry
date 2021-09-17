import * as assert from 'assert';
import mock from 'mock-fs';
import { GitpodIdManager } from '../../gitpod/gitpodIdManager';
import { UUID } from '../../utils/uuid';

const redhatDir = `${process.cwd()}/.redhat/`;

suite('Test gitpod id manager', () => {
  setup(() => {  
      mock({
        '.redhat': {
          'anonymousId': 'some-uuid'
        }
      });
    });
    teardown(() => {
        mock.restore();
    });
    test('Should generate Red Hat UUID from GITPOD_GIT_USER_EMAIL env', async () => {
      process.env.GITPOD_GIT_USER_EMAIL = 'some.user@company.com';
      console.log(process.env.GITPOD_GIT_USER_EMAIL);
      const gitpod = new GitpodIdManager();
      const id = gitpod.loadRedHatUUID(redhatDir);
      const expectedId = '465b7cd6-0f77-5fc8-97ed-7b6342df109f';
      assert.strictEqual(id, expectedId);

      //Check anonymousId file was updated
      const anonymousId = UUID.readFile(UUID.getAnonymousIdFile(redhatDir));
      assert.strictEqual(anonymousId, id);
    });
});