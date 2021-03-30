import * as utils from '../../utils/events';
import * as assert from 'assert';
import { Environment } from '../../interfaces/environment';
import { TelemetryEvent } from '../..';

const env: Environment = {
    application: {
        name:'SuperCode',
        version:'6.6.6'
    },
    extension: {
        name: 'my-ext',
        version: '1.2.3'
    },
    username:'Fred',
    platform: {
        name: 'DeathStar II'
    },
}

suite('Test events enhancements', () => {
    test('should inject environment data', async () => {
        const event: TelemetryEvent = {
            name:'Something',
            properties: {
                foo: 'bar',
            }
        }

        const betterEvent = utils.enhance(event, env);

        assert.strictEqual(betterEvent.properties.app_name, 'SuperCode');
        assert.strictEqual(betterEvent.properties.app_version, '6.6.6');
        assert.strictEqual(betterEvent.properties.extension_name, 'my-ext');
        assert.strictEqual(betterEvent.properties.extension_version, '1.2.3');
        assert.strictEqual(betterEvent.properties.foo, 'bar');
        assert.strictEqual(betterEvent.context.ip, '0.0.0.0');
        
    });

    test('should anonymize data', async () => {
        const event: TelemetryEvent = {
            name:'Something',
            properties: {
                foo: 'Fred likes Nutella',
                bar: 'That c:\\foo\\bar looks like a path',
                error: 'An error occured in /foo/bar.txt! But we\'re fine',
                multiline: 'That url file://foo/bar.txt is gone!\nThat c:\\foo\\bar too',
            }
        }

        const betterEvent = utils.enhance(event, env);

        assert.strictEqual(betterEvent.properties.foo, '_username_ likes Nutella');
        assert.strictEqual(betterEvent.properties.bar, 'That anonymized/path looks like a path');
        assert.strictEqual(betterEvent.properties.error, 'An error occured in anonymized/path But we\'re fine');
        assert.strictEqual(betterEvent.properties.multiline, 'That url anonymized/path is gone!\nThat anonymized/path too');
    });
});