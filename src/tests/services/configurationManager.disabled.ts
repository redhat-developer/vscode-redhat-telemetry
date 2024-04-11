import * as assert from "assert";
import * as fs from 'fs';
import { afterEach, beforeEach } from "mocha";
import * as mockFS from 'mock-fs';
import * as path from "path";
import { Uri } from "vscode";
import env from "../../common/envVar";
import { ConfigurationManager, DEFAULT_CONFIG_URL, TELEMETRY_CONFIG } from "../../common/impl/configurationManager";
import { FileSystemStorageService } from "../../common/vscode/fileSystemStorageService";

//DISABLED as we need to mock VS Code
suite('Test configuration manager', () => {

    let configurationManager: ConfigurationManager;

    let realFetch: typeof fetch;

    const cacheDir = `${process.cwd()}/extension/cache`;
    const storageService = new FileSystemStorageService(Uri.file(cacheDir));

    const remoteConfig = {
        "*": {
            "enabled":"all",
            "refresh": "3h",
            "ratio": "1",
            "includes": [
                {
                    "name" : "*"
                }
            ]
        },
        "redhat.vscode-yaml":{
            "enabled": "errors",
            "ratio": "0.5",
            "excludes": [
                {
                    "property": "error",
                    "value": "*stackoverflow*"
                }
            ]
        },
        "redhat.vscode-hypothetical": {
            "enabled": "off"
        }
    }

    beforeEach(() => {
        mockFS({
                'extension/cache': {}
        });
        realFetch = global.fetch;
        configurationManager = new ConfigurationManager('redhat.vscode-hypothetical', storageService);
        global.fetch = (url) => {
            if (url === DEFAULT_CONFIG_URL) {
                return Promise.resolve(new Response(
                    Buffer.from(JSON.stringify(remoteConfig)).buffer,
                    { status: 200 }
                ));
            }
        };
    });

    afterEach(() => {
        env[ConfigurationManager.TEST_CONFIG_KEY] = undefined;
        global.fetch = realFetch;
        mockFS.restore();
    });

    test('Should download remote config', async () => {
        const json = await configurationManager.fetchRemoteConfiguration();
        assert.deepStrictEqual(json, remoteConfig);
    });

    test('Should update stale config', async ()=> {
        const origTimestamp = '12345678';
        mockFS.restore();
        mockFS({
            'extension/cache': {
                'telemetry-config.json': '{'+
                        '"*": {'+
                            '"enabled":"errors",'+
                            '"timestamp" : "12345678",'+
                            '"refresh": "12h"'+
                        '}'+
                    '}'
            }
        });
        const config = await configurationManager.getExtensionConfiguration();
        const referenceTimestamp = config.json.timestamp;
        assert.notStrictEqual(referenceTimestamp, origTimestamp);
        assert.strictEqual(config.json.enabled, 'off');

        const configPath = path.join(cacheDir, TELEMETRY_CONFIG);
        const jsonConfig = JSON.parse(fs.readFileSync(configPath, { encoding: 'utf8' }));
        assert.strictEqual(jsonConfig.timestamp, referenceTimestamp);
    });

    test('Should store remote content locally', async ()=> {
        const filePath = path.join(cacheDir, TELEMETRY_CONFIG);
        assert.ok(!fs.existsSync(filePath), `${TELEMETRY_CONFIG} should not exist`);

        const config1 = await configurationManager.getExtensionConfiguration();
        assert.ok(fs.existsSync(filePath), `${TELEMETRY_CONFIG} should exist`);
        const referenceTimestamp = config1.json.timestamp;

        //No http request was made here
        configurationManager = new ConfigurationManager('redhat.vscode-other', storageService);
        const config = await configurationManager.getExtensionConfiguration();
        assert.strictEqual(config.json.timestamp, referenceTimestamp);//Same timestamp
        delete config.json['timestamp'];
        assert.deepStrictEqual(config.json ,{
            "refresh": "3h",
            "includes": [
                {
                    "name" : "*"
                }
            ],
            "enabled": "all",
            "ratio": "1"
        });
    });

    test('Should inherit config', async () => {
        configurationManager = new ConfigurationManager('random-vscode', storageService);
        const config = await configurationManager.getExtensionConfiguration();
        assert.ok(config.json.timestamp);
        delete config.json['timestamp'];
        assert.deepStrictEqual(config.json ,{
            "enabled":"all",
            "refresh": "3h",
            "ratio": "1",
            "includes": [
                {
                    "name" : "*"
                }
            ]
        },);
    });

    test('Should read embedded config', async () => {
        mockFS.restore();
        env[ConfigurationManager.TEST_CONFIG_KEY] = 'true';
        global.fetch = (url) => {
            if (url === DEFAULT_CONFIG_URL) {
                return Promise.resolve(new Response(
                    undefined,
                    { status: 404 }
                ));
            }
        };

        const config = await configurationManager.getExtensionConfiguration();
        assert.deepStrictEqual(config.json ,{
            "refresh": "2h",
            "includes": [
                {
                    "name" : "*"
                }
            ],
            "enabled": "errors",
            "ratio": "0.5",
            "excludes": [
                {
                    "property": "error",
                    "value": "*stackoverflow*"
                }
            ]
        });
    });
});