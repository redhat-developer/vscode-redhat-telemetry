import mockFS from 'mock-fs';
import * as fs from 'fs';
import path from "path";
import * as assert from 'assert';
import { FileSystemCacheService } from '../../services/fileSystemCacheService';

let cacheService: FileSystemCacheService;

const cacheDir = `${process.cwd()}/extension/cache`;

suite('Test cache service', () => {
  setup(() => {
    mockFS({
      'extension/cache': {
        'identity.txt': 'hash'
      }
    });

    cacheService = new FileSystemCacheService(cacheDir);
  });
  teardown(() => {
    mockFS.restore();
  });
  test('Should create cache directory recursively', async () => {
    const cacheDir = `${process.cwd()}/extensions/cache/` + new Date().getTime();
    cacheService = new FileSystemCacheService(cacheDir);
    const filePath = path.join(cacheDir, 'something.txt');
    await cacheService.put('something', 'hash');
    assert.ok(fs.existsSync(filePath), 'something.txt should exist');

  });
  test('Should read data from FS', async () => {
    let data = await cacheService.get('identity');
    assert.strictEqual(data, 'hash');
    const filePath = path.join(cacheDir, 'identity.txt');

    // Delete underlying file and check data is read from memory from now on
    fs.unlinkSync(filePath);
    data = await cacheService.get('identity');
    assert.strictEqual(data, 'hash');
    assert.ok(!fs.existsSync(filePath), 'identity.txt should not exist');

  });

  test('Should write data to FS', async () => {
    const filePath = path.join(cacheDir, 'something.txt');
    assert.ok(!fs.existsSync(filePath), 'something.txt should not exist');
    await cacheService.put('something', 'hash');
    assert.ok(fs.existsSync(filePath), 'something.txt should exist');
  });
});