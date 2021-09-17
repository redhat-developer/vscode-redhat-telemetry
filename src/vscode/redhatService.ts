import * as fs from 'fs';
import * as path from 'path';
import { ConfigurationChangeEvent, Disposable, env, Extension, ExtensionContext, window, workspace } from "vscode";
import { TelemetryService, TelemetryServiceBuilder } from "..";
import { RedHatService } from "../interfaces/redhatService";
import { FileSystemCacheService } from '../services/fileSystemCacheService';
import { IdManagerFactory } from "../services/idManagerFactory";
import { getExtensionId, loadPackageJson } from '../utils/extensions';
import { Logger } from "../utils/logger";
import { getEnvironment } from "../utils/platform-node";
import { DEFAULT_SEGMENT_DEBUG_KEY, DEFAULT_SEGMENT_KEY, OPT_OUT_INSTRUCTIONS_URL, PRIVACY_STATEMENT_URL } from './constants';
import { VSCodeSettings } from './settings';


const RETRY_OPTIN_DELAY_IN_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Returns a new `RedHatService` instance for a Visual Studio Code extension. For telemetry, the following is performed:
 * - A preference listener enables/disables  telemetry based on changes to `redhat.telemetry.enabled`
 * - If `redhat.telemetry.enabled` is not set, a popup requesting telemetry opt-in will be displayed
 * - when the extension is deactivated, a telemetry shutdown event will be emitted (if telemetry is enabled)
 *  
 * @param context the extension's context
 * @returns a Promise of RedHatService
 */
export async function getRedHatService(context: ExtensionContext): Promise<RedHatService> {
  const extensionInfo = getExtension(context);
  const extensionId = extensionInfo.id;
  const packageJson = getPackageJson(extensionInfo);
  const settings = new VSCodeSettings();
  const idManager = IdManagerFactory.getIdManager();
  const cachePath = path.resolve(getTelemetryWorkingDir(context), 'cache');
  const builder = new TelemetryServiceBuilder(packageJson)
    .setSettings(settings)
    .setIdManager(idManager)
    .setCacheService(new FileSystemCacheService(cachePath))
    .setEnvironment(await getEnvironment(extensionId, packageJson.version));

  const telemetryService = await builder.build();

  // register disposable to send shutdown event
  context.subscriptions.push(shutdownHook(telemetryService));

  // register preference listener for that extension, 
  // so it stops/starts sending data when redhat.telemetry.enabled changes
  context.subscriptions.push(onDidChangeTelemetryEnabled(telemetryService));

  openTelemetryOptInDialogIfNeeded(context, extensionId, settings);

  telemetryService.send({
    type: 'identify',
    name: 'identify'
  });

  return {
    getTelemetryService: () => Promise.resolve(telemetryService),
    getIdManager: () => Promise.resolve(idManager)
  }
}

function onDidChangeTelemetryEnabled(telemetryService: TelemetryService): Disposable {
  return workspace.onDidChangeConfiguration(
    //as soon as user changed the redhat.telemetry setting, we consider
    //opt-in (or out) has been set, so whichever the choice is, we flush the queue
    (e: ConfigurationChangeEvent) => {
      telemetryService.flushQueue();
    }
  );
}

async function openTelemetryOptInDialogIfNeeded(context: ExtensionContext, extensionId:string, settings: VSCodeSettings) {
  if (settings.isTelemetryConfigured()) {
    return;
  }

  let popupInfo: PopupInfo | undefined;

  const parentDir = getTelemetryWorkingDir(context);
  const optinPopupInfo = path.resolve(parentDir, 'redhat.optin.json');
  if (fs.existsSync(optinPopupInfo)) {
    const rawdata = fs.readFileSync(optinPopupInfo, { encoding: 'utf8' });
    popupInfo = JSON.parse(rawdata);
  }
  if (popupInfo) {
    if (popupInfo.sessionId !== env.sessionId || popupInfo.owner !== extensionId) {
      //someone else is showing the popup, bail.
      return;
    }
  } else {
    popupInfo = {
      owner: extensionId,
      sessionId: env.sessionId,
      time: new Date().getTime() //for troubleshooting purposes
    }
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    fs.writeFileSync(optinPopupInfo, JSON.stringify(popupInfo));
    context.subscriptions.push({
      dispose: () => { safeCleanup(optinPopupInfo); }
    });
  }

  const message: string = `Help Red Hat improve its extensions by allowing them to collect usage data. 
    Read our [privacy statement](${PRIVACY_STATEMENT_URL}?from=${extensionId}) 
  and learn how to [opt out](${OPT_OUT_INSTRUCTIONS_URL}?from=${extensionId}).`;

  const retryOptin = setTimeout(openTelemetryOptInDialogIfNeeded, RETRY_OPTIN_DELAY_IN_MS, context, settings);
  let selection: string | undefined;
  try {
    selection = await window.showInformationMessage(message, 'Accept', 'Deny');
    if (!selection) {
      //close was chosen. Ask next time.
      return;
    }
    clearTimeout(retryOptin);
    settings.updateTelemetryEnabledConfig(selection === 'Accept');
  } finally {
    if (selection) {
      safeCleanup(optinPopupInfo);
    }
  }
}

interface ExtensionInfo {
  id:string,
  packageJSON: any
}

function getExtension(context: ExtensionContext): ExtensionInfo  {
  if (context.extension) {
    return context.extension;
  }
  //When running in older vscode versions:
  const packageJson = loadPackageJson(context.extensionPath);
  const info = {
    id: getExtensionId(packageJson),
    packageJSON: packageJson
  };
  return info;
}

function getPackageJson(extension: ExtensionInfo): any {
  const packageJson = extension.packageJSON;
  if (!packageJson.segmentWriteKey) {
    packageJson.segmentWriteKey = DEFAULT_SEGMENT_KEY;
  }
  if (!packageJson.segmentWriteKeyDebug) {
    packageJson.segmentWriteKeyDebug = DEFAULT_SEGMENT_DEBUG_KEY;
  }
  return packageJson;
}

interface PopupInfo {
  owner: string,
  sessionId: string;
  time: number;
}

function safeCleanup(filePath: string) {
  try {
    fs.unlinkSync(filePath);
  } catch (err : any) {
    Logger.log(err);
  }
  Logger.log(`Deleted ${filePath}`);
}

function shutdownHook(telemetryService: TelemetryService): Disposable {
  return {
    dispose: async () => {
      await telemetryService.sendShutdownEvent();
      await telemetryService.dispose();
    }
  };
}

function getTelemetryWorkingDir(context: ExtensionContext): string {
  return path.resolve(context.globalStorageUri.fsPath, '..', 'vscode-redhat-telemetry');
}

