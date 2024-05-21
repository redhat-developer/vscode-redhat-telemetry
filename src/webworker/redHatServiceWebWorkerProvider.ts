import { RedHatService } from '../common/api/redhatService';
import { ConfigurationManager } from '../common/impl/configurationManager';
import { TelemetryServiceBuilder } from '../common/telemetryServiceBuilder';
import { getExtension, getPackageJson } from '../common/utils/extensions';
import { FileSystemStorageService } from '../common/vscode/fileSystemStorageService';
import { AbstractRedHatServiceProvider} from '../common/vscode/redhatServiceInitializer';
import { getEnvironment } from './platform';
import { Reporter } from '../common/impl/reporter'; 
import { VFSSystemIdProvider } from './vfsIdManager';
import { EventCacheService } from '../common/impl/eventCacheService';

export class RedHatServiceWebWorkerProvider extends AbstractRedHatServiceProvider {

  public async buildRedHatService(): Promise<RedHatService> {
    const extensionInfo = await getExtension(this.context);
    const extensionId = extensionInfo.id;
    const packageJson = getPackageJson(extensionInfo);
    const storageService = new FileSystemStorageService(this.getCachePath());
    const reporter = new Reporter(this.getSegmentApi(packageJson), new EventCacheService(storageService));
    const idManager = new VFSSystemIdProvider(storageService);
    const builder = new TelemetryServiceBuilder(packageJson)
      .setContext(this.context)
      .setSettings(this.settings)
      .setIdProvider(idManager)
      .setReporter(reporter)
      .setConfigurationManager(new ConfigurationManager(extensionId, storageService))
      .setEnvironment(await getEnvironment(extensionId, packageJson.version));

    const telemetryService = await builder.build();
    return {
      getTelemetryService: () => Promise.resolve(telemetryService),
      getIdProvider: () => Promise.resolve(idManager)
    }
  }
}

