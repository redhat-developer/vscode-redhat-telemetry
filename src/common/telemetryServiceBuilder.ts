import { Environment } from './api/environment';
import { IdProvider } from './api/idProvider';
import { IReporter } from './api/reporter';
import { TelemetryService } from './api/telemetry';
import { TelemetryServiceImpl } from './impl/telemetryServiceImpl';
import { TelemetryEventQueue } from './impl/telemetryEventQueue';
import { TelemetrySettings } from './api/settings';
import { getExtensionId } from './utils/extensions';
import { ConfigurationManager } from './impl/configurationManager';
import { ExtensionContext } from 'vscode';

/**
 * `TelemetryService` builder
 */
export class TelemetryServiceBuilder {
    private packageJson: any;
    private settings?: TelemetrySettings;
    private idProvider?: IdProvider;
    private environment?: Environment;
    private configurationManager?: ConfigurationManager;
    private reporter?: IReporter;
    private context?:ExtensionContext;

    constructor(packageJson?: any) {
        this.packageJson = packageJson;
    }

    public setPackageJson(packageJson: any): TelemetryServiceBuilder {
        this.packageJson = packageJson;
        return this;
    }

    public setSettings(settings: TelemetrySettings): TelemetryServiceBuilder {
        this.settings = settings;
        return this;
    }

    public setIdProvider(idProvider: IdProvider): TelemetryServiceBuilder {
        this.idProvider = idProvider;
        return this;
    }

    public setEnvironment(environment: Environment): TelemetryServiceBuilder {
        this.environment = environment;
        return this;
    }

    public setConfigurationManager(configManager: ConfigurationManager): TelemetryServiceBuilder {
        this.configurationManager = configManager;
        return this;
    }

    public setReporter(reporter: IReporter): TelemetryServiceBuilder {
        this.reporter = reporter;
        return this;
    }

    public setContext(context: ExtensionContext): TelemetryServiceBuilder {
        this.context = context;
        return this;
    }

    public async build(): Promise<TelemetryService> {
        this.validate();
        if (!this.environment) {
            this.environment = {
                extension: {
                    name: getExtensionId(this.packageJson),
                    version: this.packageJson.version
                },
                application: {
                    name: 'Unknown',
                    version: '-'
                },
                platform: {
                    name: 'Unknown',
                    version: '-'
                }
            };
        }
        const queue = this.settings!.isTelemetryConfigured()
            ? undefined
            : new TelemetryEventQueue();
        return new TelemetryServiceImpl(this.context?.globalState!, this.reporter!, queue, this.settings!, this.idProvider!, this.environment!, this.configurationManager);
    }

    private validate() {
        if (!this.context) {
            throw new Error('context is not set');
        }
        if (!this.idProvider) {
            throw new Error('idProvider is not set');
        }
        if (!this.reporter) {
            throw new Error('reporter is not set');
        }
        if (!this.packageJson) {
            throw new Error('packageJson is not set');
        }
        if (!this.environment) {
            throw new Error('Environment is not set');
        }
    }
}