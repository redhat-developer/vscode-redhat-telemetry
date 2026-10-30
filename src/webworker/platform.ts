import { UIKind, version, env as vscodeEnv } from 'vscode';
import type { Environment } from '../common/api/environment';
import env from '../common/envVar';
import { getCountry } from '../common/utils/geolocation';
import { parseUserAgent } from './userAgent';

const userAgentInfo = parseUserAgent(navigator.userAgent);

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
      distribution: DISTRO,
    },
    browser: {
      name: userAgentInfo.browser.name,
      version: userAgentInfo.browser.version,
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
  const username = env.SUDO_USER || env.C9_USER /* Cloud9 */ || env.LOGNAME || env.USER || env.LNAME || env.USERNAME;
  return username;
}

export const PLATFORM = userAgentInfo.platform.name;
export const DISTRO = userAgentInfo.platform.distribution;
export const PLATFORM_VERSION = userAgentInfo.platform.version;
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const LOCALE = navigator.language.replace('_', '-');
export const COUNTRY = getCountry(TIMEZONE);
export const UI_KIND = getUIKind();
export const USERNAME = getUsername();
