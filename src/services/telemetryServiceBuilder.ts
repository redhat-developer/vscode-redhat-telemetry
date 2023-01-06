import { Environment } from "../interfaces/environment";
import { IdManager } from "../interfaces/idManager";
import { Reporter } from "./reporter";
import { TelemetryService } from "../interfaces/telemetry";
import { TelemetryServiceImpl } from "./telemetryServiceImpl";
import { TelemetryEventQueue } from "../utils/telemetryEventQueue";
import { TelemetrySettings } from "../interfaces/settings";
import { SegmentInitializer } from "../utils/segmentInitializer";
import { FileSystemIdManager } from "./fileSystemIdManager";
import { getExtensionId } from "../utils/extensions";
import { CacheService } from "../interfaces/cacheService";
import { ConfigurationManager } from "./configurationManager";

/**
 * `TelemetryService` builder
 */
export class TelemetryServiceBuilder {
  private packageJson: any;
  private settings?: TelemetrySettings;
  private idManager?: IdManager;
  private environment?: Environment;
  private cacheService?: CacheService;
  private configurationManager?: ConfigurationManager;

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

  public setIdManager(idManager: IdManager): TelemetryServiceBuilder {
    this.idManager = idManager;
    return this;
  }

  public setEnvironment(environment: Environment): TelemetryServiceBuilder {
    this.environment = environment;
    return this;
  }

  public setConfigurationManager(
    configManager: ConfigurationManager,
  ): TelemetryServiceBuilder {
    this.configurationManager = configManager;
    return this;
  }

  public setCacheService(cacheService: CacheService): TelemetryServiceBuilder {
    this.cacheService = cacheService;
    return this;
  }

  public async build(): Promise<TelemetryService> {
    this.validate();
    const analytics = SegmentInitializer.initialize(this.packageJson);
    if (!this.idManager) {
      this.idManager = new FileSystemIdManager();
    }
    if (!this.environment) {
      this.environment = {
        extension: {
          name: getExtensionId(this.packageJson),
          version: this.packageJson.version,
        },
        application: {
          name: "Unknown",
          version: "-",
        },
        platform: {
          name: "Unknown",
          version: "-",
        },
      };
    }
    const reporter = new Reporter(analytics, this.cacheService);
    const queue = this.settings!.isTelemetryConfigured()
      ? undefined
      : new TelemetryEventQueue();
    return new TelemetryServiceImpl(
      reporter,
      queue,
      this.settings!,
      this.idManager,
      this.environment!,
      this.configurationManager,
    );
  }

  private validate() {
    if (!this.packageJson) {
      throw new Error("packageJson is not set");
    }
    if (!this.environment) {
      throw new Error("Environment is not set");
    }
  }
}
