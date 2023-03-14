import Analytics from '@segment/analytics-node';
import { ConfigurationChangeEvent, Disposable, env, ExtensionContext, workspace, window, Uri } from "vscode";
import { RedHatService } from "../api/redhatService";
import { TelemetryService } from "../api/telemetry";
import { Logger } from "../utils/logger";
import { ExtensionInfo, getExtension } from '../utils/extensions'
import { didUserDisableTelemetry, VSCodeSettings } from '../vscode/settings';
import { deleteFile, exists, mkdir, readFile, writeFile } from '../vscode/fsUtils'
import { OPT_OUT_INSTRUCTIONS_URL, PRIVACY_STATEMENT_URL } from '../impl/constants';
import { getSegmentKey } from '../utils/keyLocator';

const RETRY_OPTIN_DELAY_IN_MS = 24 * 60 * 60 * 1000; // 24h

export abstract class AbstractRedHatServiceProvider {
  
  settings: VSCodeSettings;
  extensionInfo?: ExtensionInfo;
  extensionId?: string;
  context: ExtensionContext;
  constructor(context: ExtensionContext) {
    this.settings = new VSCodeSettings();
    this.context= context;
  }

  public abstract buildRedHatService(): Promise<RedHatService>;

  public getSegmentApi(packageJson: any): Analytics {
    const writeKey = getSegmentKey(packageJson)!;
    const maxEventsInBatch = 1;
    const flushInterval = 1000;
    const httpRequestTimeout = 3000;
    return new Analytics({writeKey, maxEventsInBatch, flushInterval, httpRequestTimeout});
  }

  public getCachePath(): Uri {
   return Uri.joinPath(this.getTelemetryWorkingDir(this.context), 'cache');
  }

  /**
   * Returns a new `RedHatService` instance for a Visual Studio Code extension. For telemetry, the following is performed:
   * - A preference listener enables/disables  telemetry based on changes to `redhat.telemetry.enabled`
   * - If `redhat.telemetry.enabled` is not set, a popup requesting telemetry opt-in will be displayed
   * - when the extension is deactivated, a telemetry shutdown event will be emitted (if telemetry is enabled)
   *  
   * @param context the extension's context
   * @returns a Promise of RedHatService
   */
  public async getRedHatService(): Promise<RedHatService> {
    this.extensionInfo = await getExtension(this.context);
    this.extensionId = this.extensionInfo?.id;
    Logger.extId = this.extensionId;
    const redhatService = await this.buildRedHatService();

    const telemetryService = await redhatService.getTelemetryService();
    // register disposable to send shutdown event
    this.context.subscriptions.push(shutdownHook(telemetryService));

    // register preference listener for that extension, 
    // so it stops/starts sending data when redhat.telemetry.enabled changes
    this.context.subscriptions.push(onDidChangeTelemetryEnabled(telemetryService));

    this.openTelemetryOptInDialogIfNeeded();

    telemetryService.send({
      type: 'identify',
      name: 'identify'
    });

    return redhatService;
  }

  public getTelemetryWorkingDir(context: ExtensionContext): Uri {
    return Uri.joinPath(context.globalStorageUri, '..', 'vscode-redhat-telemetry');
  }

  async openTelemetryOptInDialogIfNeeded() {
    if (this.settings.isTelemetryConfigured() || didUserDisableTelemetry()) {
      return;
    }
  
    let popupInfo: PopupInfo | undefined;
  
    const parentDir = this.getTelemetryWorkingDir(this.context);
    const optinPopupInfo = Uri.joinPath(parentDir, 'redhat.optin.json');
    if (await exists(optinPopupInfo)) {
      const rawdata = await readFile(optinPopupInfo);
      popupInfo = JSON.parse(rawdata);
    }
    if (popupInfo) {
      if (popupInfo.sessionId !== env.sessionId || popupInfo.owner !== this.extensionId) {
        //someone else is showing the popup, bail.
        return;
      }
    } else {
      popupInfo = {
        owner: this.extensionId!,
        sessionId: env.sessionId,
        time: new Date().getTime() //for troubleshooting purposes
      }
      await writeFile(optinPopupInfo, JSON.stringify(popupInfo));
      this.context.subscriptions.push({
        dispose: () => { safeCleanup(optinPopupInfo); }
      });
    }
  
    const message: string = `Help Red Hat improve its extensions by allowing them to collect usage data. 
      Read our [privacy statement](${PRIVACY_STATEMENT_URL}?from=${this.extensionId!}) 
    and learn how to [opt out](${OPT_OUT_INSTRUCTIONS_URL}?from=${this.extensionId!}).`;
  
    const retryOptin = setTimeout(this.openTelemetryOptInDialogIfNeeded, RETRY_OPTIN_DELAY_IN_MS);
    let selection: string | undefined;
    try {
      selection = await window.showInformationMessage(message, 'Accept', 'Deny');
      if (!selection) {
        //close was chosen. Ask next time.
        return;
      }
      clearTimeout(retryOptin);
      this.settings.updateTelemetryEnabledConfig(selection === 'Accept');
    } finally {
      if (selection) {
        safeCleanup(optinPopupInfo);
      }
    }
  }
}

function onDidChangeTelemetryEnabled(telemetryService: TelemetryService): Disposable {
  return workspace.onDidChangeConfiguration(
    //as soon as user changed the redhat.telemetry setting, we consider
    //opt-in (or out) has been set, so whichever the choice is, we flush the queue
    (e: ConfigurationChangeEvent) => {
      if (e.affectsConfiguration("redhat.telemetry") || e.affectsConfiguration("telemetry")) {
        telemetryService.flushQueue();
      }
    }
  );
}

interface PopupInfo {
  owner: string,
  sessionId: string;
  time: number;
}

function safeCleanup(filePath: Uri) {
  try {
    deleteFile(filePath);
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
      Logger.log("disposed telemetry service");
    }
  };
}
