import * as utils from '../../common/utils/events';
import * as assert from 'assert';
import { Environment } from '../../common/api/environment';
import { TelemetryEvent } from '../../common/api/telemetry';

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

const USER_ID = "1234";

suite('Test events enhancements', () => {
    test('should inject environment data', async () => {
        const event: TelemetryEvent = {
            name:'Something',
            properties: {
                foo: 'bar',
            }
        }

        const betterEvent = utils.transform(event, USER_ID, env);
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
                foo: 'Fred is Fred',
                qty: 10,
                active: false,
                bar: 'That c:\\Fred\\bar looks like a path',
                error: 'An error occurred in /Users/Fred/foo/bar.txt! But we\'re fine',
                multiline: 'That url file://Fred/bar.txt is gone!\nNot that c:\\user\\bar though',
                obj: {
                    q: 'Who is Fred?',
                    a: 'Fred who?'
                }
            }
        }

        const betterEvent = utils.transform(event, USER_ID, env);

        assert.strictEqual(betterEvent.properties.qty, 10);
        assert.strictEqual(betterEvent.properties.active, false);
        assert.strictEqual(betterEvent.properties.foo, '_username_ is _username_');
        assert.strictEqual(betterEvent.properties.bar, 'That c:\\_username_\\bar looks like a path');
        assert.strictEqual(betterEvent.properties.error, 'An error occurred in /Users/_username_/foo/bar.txt! But we\'re fine');
        assert.strictEqual(betterEvent.properties.multiline, 'That url file://_username_/bar.txt is gone!\nNot that c:\\user\\bar though');
        assert.strictEqual(betterEvent.properties.obj.q, 'Who is _username_?');
        assert.strictEqual(betterEvent.properties.obj.a, '_username_ who?');
    });

    test('should not anonymize special usernames', async () => {
        utils.IGNORED_USERS.forEach((user) => {
            const cheEnv: Environment = {
                application: {
                    name:'SuperCode',
                    version:'6.6.6'
                },
                extension: {
                    name: 'my-ext',
                    version: '1.2.3'
                },
                username: user,
                platform: {
                    name: 'DeathStar II'
                },
            }

            const event: TelemetryEvent = {
                name:'Something',
                properties: {
                    foo: 'vscode likes theia',
                    multiline: 'That gitpod \nusername is a redhat user',
                }
            }

            const betterEvent = utils.transform(event, USER_ID, cheEnv);
            assert.strictEqual(betterEvent.properties.foo, event.properties.foo);
            assert.strictEqual(betterEvent.properties.multiline, event.properties.multiline);
        });
    });

    test('should not anonymize technical properties', async () => {
        const someEnv: Environment = {
            application: {
                name:'codename',
                version:'codename'
            },
            extension: {
                name: 'codename',
                version: 'codename'
            },
            username: 'codename',
            platform: {
                name: 'codename'
            },
        }

        const event: TelemetryEvent = {
            name:'Something',
            properties: {
                foo: 'codename likes vscode',
                multiline: 'That gitpod \ncodename is a redhat user',
            }
        }

        const betterEvent = utils.transform(event, USER_ID, someEnv);
        assert.strictEqual(betterEvent.properties.extension_name, someEnv.extension.name);
        assert.strictEqual(betterEvent.properties.extension_version, someEnv.extension.version);
        assert.strictEqual(betterEvent.properties.app_name, someEnv.application.name);
        assert.strictEqual(betterEvent.properties.app_version, someEnv.application.version);
        assert.strictEqual(betterEvent.properties.foo, '_username_ likes vscode');
        assert.strictEqual(betterEvent.properties.multiline, 'That gitpod \n_username_ is a redhat user');
    });
});
