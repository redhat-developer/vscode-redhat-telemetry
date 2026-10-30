import * as assert from 'node:assert';
import { suite, test } from 'vitest';
import { getLocale } from '../../common/utils/locale';

suite('Test locale', () => {
  test('prefers locale environment variables over the ICU locale', () => {
    assert.strictEqual(getLocale({ LANGUAGE: 'fr_FR.UTF-8' }, 'en-US'), 'fr-FR');
    assert.strictEqual(getLocale({ LANG: 'de_DE.UTF-8' }, 'en-US'), 'de-DE');
    assert.strictEqual(getLocale({ LANG: 'de_DE.UTF-8', LC_MESSAGES: 'pt_BR.UTF-8' }, 'en-US'), 'pt-BR');
    assert.strictEqual(getLocale({ LC_MESSAGES: 'pt_BR.UTF-8', LC_ALL: 'ja_JP.UTF-8' }, 'en-US'), 'ja-JP');
  });
  test('normalises encoding, modifier and LANGUAGE list', () => {
    assert.strictEqual(getLocale({ LANG: 'en_US.UTF-8' }), 'en-US');
    assert.strictEqual(getLocale({ LANG: 'sr_RS@latin' }), 'sr-RS');
    assert.strictEqual(getLocale({ LANGUAGE: 'fr_FR:de_DE' }), 'fr-FR');
  });
  test('falls back to the resolved ICU locale', () => {
    assert.strictEqual(getLocale({}, 'fr-FR'), 'fr-FR');
    assert.strictEqual(getLocale({}), new Intl.DateTimeFormat().resolvedOptions().locale.replace(/^und$/, 'en-US'));
  });
  test('falls back to en-US when the locale is undetermined', () => {
    assert.strictEqual(getLocale({}, 'und'), 'en-US');
  });
});
