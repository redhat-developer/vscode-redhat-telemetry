import { Environment } from '../common/api/environment';
import { env as vscodeEnv, UIKind, version} from 'vscode';

import { getCountry } from '../common/utils/geolocation';
import env from '../common/envVar';
import UAParser from 'ua-parser-js';

let userAgentInfo : UAParser.IResult;
export const PLATFORM = getPlatform();
export const DISTRO = getDistribution();
export const PLATFORM_VERSION = getUAInfo().os.version;
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const LOCALE = navigator.language.replace('_', '-');
export const COUNTRY = getCountry(TIMEZONE);
export const UI_KIND = getUIKind();
export const USERNAME = getUsername();

function getUAInfo() {
    if (userAgentInfo) {
        return userAgentInfo;
    }
    userAgentInfo = new UAParser(navigator.userAgent).getResult();
    return userAgentInfo;
}

// list of known Linux distros given by ChatGPT ;-), tweaked a bit
const linuxes = /^((.*)Ubuntu(.*)|Debian|Fedora|CentOS|Red Hat|(.*)Linux(.*)|Gentoo|(.*)SUSE(.*)|Slackware|Solus|Manjaro|Raspbian|Elementary OS|Zorin OS|Pop!_OS|Endless OS|Deepin|Tails|BlackArch|BackBox|Parrot Security|Knoppix|Peppermint|LXLE|Chrome OS|CrunchBang|Finnix|FreeNAS|gNewSense|NimbleX|NixOS|Ophcrack|PFSense|pfSense|Sabayon|SliTaz|Zenwalk|ArchBang|ArchLabs|Artix|BlankOn|BlueOnyx|Calcula|Calculate|CRUX|Devuan|Frugalware|Funtoo|GParted|Joli OS|Kanotix|Lakka|Linspire|Madbox|Makulu|NimbleX|NixOS|NST|OpenELEC|OpenIndiana|OpenMandriva|OpenVZ|Q4OS|Qubes OS|ReactOS|Sabayon|Salix|Slackel|Slackware|Slax|SmartOS|SME Server|Sonic|SystemRescueCd|Trisquel|TrueOS|VyOS|XenServer|Zorin OS|CRUX)$/i

function getPlatform(): string {
    const platform: string = (getUAInfo().os.name)?getUAInfo().os.name!:"Unknown";
    if (platform.startsWith('Windows') ) {
        return 'Windows';
    }
    if (platform.startsWith('Mac') ) {
        return 'Mac';
    }
    if (platform.toLowerCase().indexOf('BSD') > -1 ) {
        return 'BSD';
    }
    //This is brittle AF. Testing against a bunch of hardcoded distros, the list can only go stale, 
    //but we want to limit the amount of platforms here
    if (linuxes.test(platform)) {
        return "Linux";
    }
    return "Unknown";
}
function getDistribution(): string|undefined {
    const os = getPlatform();
    if (os === 'Linux' || os === 'Unknown'|| os === 'BSD' && getUAInfo().os.name) {
      return getUAInfo().os.name
    }
    return undefined;
}

export async function getEnvironment(extensionId: string, extensionVersion:string): Promise<Environment> {
    const browser = getUAInfo().browser;
    return {
        extension: {
            name:extensionId,
            version:extensionVersion,
        },
        application: {
            name: vscodeEnv.appName,
            version: version,
            uiKind: UI_KIND,
            remote: vscodeEnv.remoteName !== undefined,
            appHost: vscodeEnv.appHost
        },
        platform:{
            name:PLATFORM,
            version:PLATFORM_VERSION,
            distribution: DISTRO
        },
        browser: {
            name: browser.name,
            version: browser.version
        },
        timezone:TIMEZONE,
        locale:LOCALE,
        country: COUNTRY,
        username: USERNAME
    };
}
function getUIKind():string {
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
    let username = (
        env.SUDO_USER ||
        env.C9_USER /* Cloud9 */ ||
        env.LOGNAME ||
        env.USER ||
        env.LNAME ||
        env.USERNAME
    );
    return username;
}

