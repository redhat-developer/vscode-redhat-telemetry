import os from 'node:os';
import { promisify } from 'node:util';
import getos, { type LinuxOs } from 'getos';
import { UIKind, version, env as vscodeEnv } from 'vscode';
import type { Environment } from '../common/api/environment';
import env from '../common/envVar';
import { getCountry } from '../common/utils/geolocation';
import { getLocale } from '../common/utils/locale';

export const PLATFORM = getPlatform();
export const DISTRO = getDistribution();
export const PLATFORM_VERSION = os.release();
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const LOCALE = getLocale();
export const COUNTRY = getCountry(TIMEZONE);
export const UI_KIND = getUIKind();
export const USERNAME = getUsername();

function getPlatform(): string {
  const platform: string = os.platform();
  if (platform.startsWith('win')) {
    return 'Windows';
  }
  if (platform.startsWith('darwin')) {
    return 'Mac';
  }
  return platform.charAt(0).toUpperCase() + platform.slice(1);
}
async function getDistribution(): Promise<string | undefined> {
  if (os.platform() === 'linux') {
    const platorm = (await promisify(getos)()) as LinuxOs;
    return platorm.dist;
  }
  return undefined;
}

export async function getEnvironment(extensionId: string, extensionVersion: string): Promise<Environment> {
  return {
    extension: {
      name: extensionId,
      version: extensionVersion,
    },
    application: {
      name: vscodeEnv.appName,
      version: version,
      uiKind: UI_KIND,
      remote: vscodeEnv.remoteName !== undefined,
      appHost: vscodeEnv.appHost,
    },
    platform: {
      name: PLATFORM,
      version: PLATFORM_VERSION,
      distribution: await DISTRO,
    },
    timezone: TIMEZONE,
    locale: LOCALE,
    country: COUNTRY,
    username: USERNAME,
  };
}
function getUIKind(): string {
  switch (vscodeEnv.uiKind) {
    case UIKind.Desktop:
      return 'Desktop';
    case UIKind.Web:
      return 'Web';
    default:
      return 'Unknown';
  }
}

function getUsername(): string | undefined {
  let username = env.SUDO_USER || env.C9_USER /* Cloud9 */ || env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
  if (!username) {
    try {
      username = os.userInfo().username;
    } catch (_) {}
  }
  return username;
}
