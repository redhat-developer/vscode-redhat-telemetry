import env from "../envVar";
import { Logger } from "../utils/logger";
import { FileSystemStorageService } from "../vscode/fileSystemStorageService";
import { Configuration } from "./configuration";

export const DEFAULT_CONFIG_URL =  'https://raw.githubusercontent.com/redhat-developer/vscode-redhat-telemetry/main/src/config/telemetry-config.json';
export const TELEMETRY_CONFIG = "telemetry-config.json";

export class ConfigurationManager {
    public static REMOTE_CONFIG_KEY = 'REDHAT_TELEMETRY_REMOTE_CONFIG_URL';
    public static TEST_CONFIG_KEY = 'REDHAT_TELEMETRY_TEST_CONFIG_KEY';

    constructor(private extensionId: string, private storageService: FileSystemStorageService){}

    private extensionConfig: Promise<Configuration>|undefined;

    public async refresh(): Promise<void> {
        const remoteConfig = await this.fetchRemoteConfiguration();
        if (remoteConfig) {
            remoteConfig['timestamp'] = new Date().getTime();
            await this.saveLocalConfiguration(remoteConfig);
        }
        return remoteConfig;
    }

    public async getExtensionConfiguration(): Promise<Configuration> {
        let extensionConfig = this.extensionConfig;
        if (extensionConfig) {
            if (!isStale(await extensionConfig)) {
                return extensionConfig;
            }
            this.extensionConfig = undefined;
        }
        Logger.log("Loading json config for "+this.extensionId);
        this.extensionConfig = this.loadConfiguration(this.extensionId);
        return this.extensionConfig;
    }

    private async loadConfiguration(extensionId: string): Promise<Configuration> {
        let localConfig: any;
        try {
            localConfig = await this.getLocalConfiguration();
            if (isStale(localConfig)) {
                localConfig = await this.refresh();
            }
        } catch(e: any) {
            console.error(`Failed to load local configuration: ${e?.message}`);
        }
        let fullConfig:any;
        if (localConfig) {
            fullConfig = localConfig;
        } else {
            fullConfig = await this.getEmbeddedConfiguration();
        }
        const json = getExtensionConfig(fullConfig, extensionId);
        return new Configuration(json);
    }
    async saveLocalConfiguration(fullConfig: any): Promise<void> {
        try {
            return this.storageService.writeToFile(TELEMETRY_CONFIG, JSON.stringify(fullConfig, null, 2));
        } catch (e) {
            console.error(`Error saving configuration locally: ${e}`);
        }
    }

    public async fetchRemoteConfiguration(uri?: string): Promise<any> {
        let telemetryUri = ( uri )? uri: env[ConfigurationManager.REMOTE_CONFIG_KEY];
        if (!telemetryUri) {
            telemetryUri = DEFAULT_CONFIG_URL;
        }
        Logger.info(`Updating vscode-redhat-telemetry configuration from ${telemetryUri}`);
        const response = await fetch(telemetryUri);
        try {
            return response?.json();
        } catch (e) {
            console.error(`Failed to parse:\n`+(await response?.text())+'\n'+e);
        }
        return undefined;
    }

    public async getLocalConfiguration(): Promise<any|undefined> {
        const content = await this.storageService.readFromFile(TELEMETRY_CONFIG);
        if (content) {
            return JSON.parse(content);
        }
        return undefined;
    }

    public async getEmbeddedConfiguration(): Promise<any> {
        return require('../../config/telemetry-config.json');
    }

}
const refreshPattern = /\d+/g;
const REFRESH_PERIOD = 6;
const HOUR_IN_MILLISEC = 60 * 60 * 1000;

function isStale(configOrJson: any): boolean {
    if (!configOrJson) {
        return true;
    }
    let config: any;
    if (configOrJson instanceof Configuration) {
        config = configOrJson.json;
    } else {
        config = configOrJson;
    }
    const timestamp = config.timestamp? config.timestamp : 0;
    let period = REFRESH_PERIOD;
    if (config.refresh) {
       const res = (config.refresh as string).match(refreshPattern);
       if (res && res.length) {
        period = parseInt(res[0]);
       }
    }
    let elapsed = new Date().getTime() - timestamp;
    return (elapsed > period * HOUR_IN_MILLISEC);
}

function getExtensionConfig(fullConfig: any, extensionId: string) {
    const extensionConfig = Object.assign({}, fullConfig['*'], fullConfig[extensionId]);
    if (fullConfig.timestamp) {
        extensionConfig['timestamp'] = fullConfig.timestamp;
    }
    return extensionConfig;
}