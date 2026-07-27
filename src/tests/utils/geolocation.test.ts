import * as assert from 'node:assert';
import { suite, test } from 'vitest';
import { getCountry } from '../../common/utils/geolocation';

suite('Test get country from timezone', () => {
  test('known country', async () => {
    assert.strictEqual('FR', getCountry('Europe/Paris'));
  });
  test('unknown country', async () => {
    assert.strictEqual('ZZ', getCountry(''));
    assert.strictEqual('ZZ', getCountry('Groland/Groville'));
  });
});
