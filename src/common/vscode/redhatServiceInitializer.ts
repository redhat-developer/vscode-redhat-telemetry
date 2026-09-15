import Analytics from '@segment/analytics-node';
import {
  type ConfigurationChangeEvent,
  type Disposable,
  type ExtensionContext,
  env,
  Uri,
  window,
  workspace,
} from 'vscode';
import type { RedHatService } from '../api/redhatService';
import type { TelemetrySettings } from '../api/settings';
import type { TelemetryService } from '../api/telemetry';
import type { TelemetryOptions } from '../api/telemetryOptions';
import { CONFIG_KEY, OPT_OUT_INSTRUCTIONS_URL, PRIVACY_STATEMENT_URL } from '../impl/constants';
import { type ExtensionInfo, getExtension } from '../utils/extensions';
import { getSegmentKey } from '../utils/keyLocator';
import { Logger } from '../utils/logger';
import { deleteFile, exists, readFile, writeFile } from '../vscode/fsUtils';
import { CustomVSCodeSettings, didUserDisableTelemetry, VSCodeSettings } from '../vscode/settings';

const RETRY_OPTIN_DELAY_IN_MS = 24 * 60 * 60 * 1000; // 24h

export abstract class AbstractRedHatServiceProvider {
  settings: TelemetrySettings;
  options?: TelemetryOptions;
  extensionInfo?: ExtensionInfo;
  extensionId?: string;
  context: ExtensionContext;
  constructor(context: ExtensionContext, options?: TelemetryOptions) {
    this.options = options;
    this.settings =
      options?.telemetryNamespace !== undefined
        ? new CustomVSCodeSettings(options.telemetryNamespace, options.ignoreGlobalTelemetryLevel)
        : new VSCodeSettings();
    this.context = context;
  }

  public abstract buildRedHatService(): Promise<RedHatService>;

  public getSegmentApi(packageJson: any): Analytics {
    const writeKey = getSegmentKey(packageJson)!;
    const maxEventsInBatch = 1;
    const flushInterval = 1000;
    const httpRequestTimeout = 3000;
    return new Analytics({ writeKey, maxEventsInBatch, flushInterval, httpRequestTimeout });
  }

  public getCachePath(): Uri {
    return Uri.joinPath(this.getTelemetryWorkingDir(this.context), 'cache');
  }

  /**
   * Returns a new `RedHatService` instance for a Visual Studio Code extension. For telemetry, the following is performed:
   * - A preference listener enables/disables telemetry based on changes to the configured telemetry key
   * - If the telemetry key is not set, a popup requesting telemetry opt-in will be displayed
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

    // register preference listener; watches the custom namespace when provided
    const configNamespace =
      this.options?.telemetryNamespace !== undefined ? `${this.options.telemetryNamespace}.telemetry` : undefined;
    this.context.subscriptions.push(
      onDidChangeTelemetryEnabled(telemetryService, configNamespace, this.options?.ignoreGlobalTelemetryLevel),
    );

    this.openTelemetryOptInDialogIfNeeded().catch((err) => Logger.log(err));

    telemetryService.send({
      type: 'identify',
      name: 'identify',
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

    const lockNamespace = this.options?.telemetryNamespace ?? CONFIG_KEY.split('.')[0];
    const lockFilename = `${lockNamespace}.optin.json`;
    const parentDir = this.getTelemetryWorkingDir(this.context);
    const optinPopupInfo = Uri.joinPath(parentDir, lockFilename);
    if (await exists(optinPopupInfo)) {
      const rawdata = await readFile(optinPopupInfo);
      popupInfo = JSON.parse(rawdata);
    }
    if (popupInfo) {
      if (popupInfo.sessionId !== env.sessionId) {
        // Stale lock from a previous session — clean it up and re-acquire.
        safeCleanup(optinPopupInfo);
        popupInfo = undefined;
      } else if (popupInfo.owner !== this.extensionId) {
        // Another extension in this session owns the popup.
        return;
      }
    }
    if (!popupInfo) {
      popupInfo = {
        owner: this.extensionId!,
        sessionId: env.sessionId,
        time: Date.now(), //for troubleshooting purposes
      };
      await writeFile(optinPopupInfo, JSON.stringify(popupInfo));
      this.context.subscriptions.push({
        dispose: () => {
          safeCleanup(optinPopupInfo);
        },
      });
    }

    const message: string = buildOptInMessage(this.options, this.extensionId!);

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

/**
 * Builds the opt-in dialog message string. Exported for unit testing.
 * Uses custom text/URLs from `options` when provided; falls back to Red Hat defaults.
 */
export function buildOptInMessage(options: TelemetryOptions | undefined, extensionId: string): string {
  if (options?.telemetryNamespace && !options.optInMessage) {
    throw new Error(
      `TelemetryOptions.optInMessage is required when telemetryNamespace is set (namespace: "${options.telemetryNamespace}"). ` +
        'The default opt-in message uses Red Hat branding, which is incorrect for third-party consumers.',
    );
  }

  if (options?.optInMessage) {
    return options.optInMessage;
  }

  const privacyUrl = options?.privacyStatementUrl ?? PRIVACY_STATEMENT_URL;
  const optOutUrl = options?.optOutInstructionsUrl ?? OPT_OUT_INSTRUCTIONS_URL;

  let privacyUrlStr: string;
  try {
    const parsed = new URL(privacyUrl);
    parsed.searchParams.set('from', extensionId);
    privacyUrlStr = parsed.toString();
  } catch {
    // Relative or malformed URL — append query string manually.
    const separator = privacyUrl.includes('?') ? '&' : '?';
    privacyUrlStr = `${privacyUrl}${separator}from=${encodeURIComponent(extensionId)}`;
  }

  return `Help Red Hat improve its extensions by allowing them to collect usage data.
      Read our [privacy statement](${privacyUrlStr})
    and learn how to [opt out](${optOutUrl}).`;
}

/**
 * Registers a configuration change listener that flushes the telemetry queue whenever the
 * telemetry enablement setting changes.
 *
 * @param telemetryService - the service whose queue will be flushed
 * @param configNamespace  - when provided (e.g. `"myext.telemetry"`), watches only that
 *                           namespace. VS Code's global `"telemetry"` is not watched for
 *                           custom pipelines. When absent, watches `"redhat.telemetry"` and
 *                           `"telemetry"` (existing behavior).
 */
export function onDidChangeTelemetryEnabled(
  telemetryService: TelemetryService,
  configNamespace?: string,
  ignoreGlobalTelemetryLevel = false,
): Disposable {
  const watchedNamespace = configNamespace ?? 'redhat.telemetry';
  return workspace.onDidChangeConfiguration((e: ConfigurationChangeEvent) => {
    const affectsNamespace = e.affectsConfiguration(watchedNamespace);
    // Only react to VS Code's global telemetry setting when using the default
    // pipeline AND the caller hasn't opted out of the global level.
    const affectsGlobal = !configNamespace && !ignoreGlobalTelemetryLevel && e.affectsConfiguration('telemetry');
    if (affectsNamespace || affectsGlobal) {
      telemetryService.flushQueue();
    }
  });
}

interface PopupInfo {
  owner: string;
  sessionId: string;
  time: number;
}

function safeCleanup(filePath: Uri) {
  try {
    deleteFile(filePath);
  } catch (err: any) {
    Logger.log(err);
  }
  Logger.log(`Deleted ${filePath}`);
}

function shutdownHook(telemetryService: TelemetryService): Disposable {
  return {
    dispose: async () => {
      await telemetryService.sendShutdownEvent();
      await telemetryService.dispose();
      Logger.log('disposed telemetry service');
    },
  };
}
