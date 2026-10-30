import Bowser from 'bowser';

export interface UserAgentInfo {
  platform: {
    name: string;
    version?: string;
    distribution?: string;
  };
  browser: {
    name?: string;
    version?: string;
  };
}

const WINDOWS = 'Windows';
const MAC = 'Mac';
const LINUX = 'Linux';
const BSD = 'BSD';
const UNKNOWN = 'Unknown';

// Bowser reports every Linux distribution as plain "Linux", so we look for the
// distribution in the user agent ourselves.
// This is brittle AF. Testing against a bunch of hardcoded distros, the list can only go stale,
// but we want to limit the amount of distributions here.
const linuxDistros = [
  'Kubuntu',
  'Xubuntu',
  'Lubuntu',
  'Ubuntu',
  'Debian',
  'Fedora',
  'CentOS',
  'Red Hat',
  'Gentoo',
  'openSUSE',
  'SUSE',
  'Slackware',
  'Solus',
  'Manjaro',
  'Raspbian',
  'Elementary OS',
  'Zorin OS',
  'Pop!_OS',
  'Endless OS',
  'Deepin',
  'Tails',
  'BlackArch',
  'BackBox',
  'Parrot Security',
  'Knoppix',
  'Peppermint',
  'LXLE',
  'CrunchBang',
  'Finnix',
  'NixOS',
  'Sabayon',
  'SliTaz',
  'Zenwalk',
  'ArchBang',
  'ArchLabs',
  'Artix',
  'Arch',
  'BlankOn',
  'Calculate',
  'CRUX',
  'Devuan',
  'Frugalware',
  'Funtoo',
  'Kanotix',
  'Linspire',
  'Linux Mint',
  'OpenMandriva',
  'Q4OS',
  'Qubes OS',
  'Salix',
  'Slackel',
  'Slax',
  'Trisquel',
];

// Bowser does not parse BSD systems at all, so we detect them from the user agent as well
const bsdSystems = ['FreeBSD', 'OpenBSD', 'NetBSD', 'DragonFly', 'PC-BSD', 'GhostBSD'];

// More specific names must come first (eg. "openSUSE" before "SUSE"), otherwise the
// shorter one wins. Word boundaries keep "Arch" from matching "aarch64".
const linuxDistroRegex = new RegExp(`\\b(${linuxDistros.join('|')})\\b`, 'i');
const bsdSystemRegex = new RegExp(`\\b(${bsdSystems.join('|')})\\b`, 'i');

// Bowser reports Windows versions as "NT 10.0", we keep the marketing version ("10")
const windowsVersionRegex = /^NT /;
const chromeOSVersionRegex = /CrOS \S+ ([\d.]+)/;

// Bowser names some browsers and mobile variants differently than we always reported them
const browserAliases: Record<string, string> = {
  'Microsoft Edge': 'Edge',
};
const mobileBrowsers = ['Chrome', 'Safari', 'Firefox'];

function findKnownName(names: string[], regex: RegExp, userAgent: string): string | undefined {
  const match = regex.exec(userAgent);
  if (!match) {
    return undefined;
  }
  const name = match[1].toLowerCase();
  return names.find((known) => known.toLowerCase() === name);
}

function getPlatformName(osName: string | undefined, userAgent: string): string {
  if (osName?.startsWith(WINDOWS)) {
    return WINDOWS;
  }
  if (osName && /^mac/i.test(osName)) {
    return MAC;
  }
  if (bsdSystemRegex.test(userAgent)) {
    return BSD;
  }
  if (osName && /^(linux|chrome os)$/i.test(osName)) {
    return LINUX;
  }
  return UNKNOWN;
}

function getDistribution(platformName: string, osName: string | undefined, userAgent: string): string | undefined {
  switch (platformName) {
    case LINUX:
      // "Chrome OS" is only reported by the parser, it does not appear in the user agent
      return findKnownName(linuxDistros, linuxDistroRegex, userAgent) ?? osName;
    case BSD:
      return findKnownName(bsdSystems, bsdSystemRegex, userAgent) ?? osName;
    case UNKNOWN:
      return osName;
    default:
      return undefined;
  }
}

function getPlatformVersion(os: Bowser.Parser.OSDetails, userAgent: string): string | undefined {
  if (os.name === 'Chrome OS') {
    // Bowser does not report the Chrome OS version, eg. "CrOS x86_64 14541.0.0"
    return chromeOSVersionRegex.exec(userAgent)?.[1] ?? os.version;
  }
  if (os.name?.startsWith(WINDOWS)) {
    return os.versionName ?? os.version?.replace(windowsVersionRegex, '');
  }
  return os.version;
}

function isMobile(osName: string | undefined, platformType: string | undefined, browserName: string): boolean {
  if (osName === 'iOS') {
    return true;
  }
  if (osName !== 'Android') {
    return false;
  }
  // Firefox is reported as "Mobile Firefox" on Android tablets too
  return browserName === 'Firefox' || platformType === 'mobile';
}

function getBrowserName(
  osName: string | undefined,
  platformType: string | undefined,
  browserName: string | undefined,
): string | undefined {
  if (!browserName) {
    return undefined;
  }
  if (browserName === 'Internet Explorer') {
    return osName === 'Windows Phone' ? 'IEMobile' : 'IE';
  }
  const name = browserAliases[browserName] ?? browserName;
  if (mobileBrowsers.includes(name) && isMobile(osName, platformType, name)) {
    return `Mobile ${name}`;
  }
  return name;
}

export function parseUserAgent(userAgent: string): UserAgentInfo {
  // Bowser throws on an empty user agent string
  const { os, browser, platform } = Bowser.getParser(userAgent || ' ').getResult();
  const platformName = getPlatformName(os.name, userAgent);
  return {
    platform: {
      name: platformName,
      version: getPlatformVersion(os, userAgent),
      distribution: getDistribution(platformName, os.name, userAgent),
    },
    browser: {
      name: getBrowserName(os.name, platform.type, browser.name),
      version: browser.version || undefined,
    },
  };
}
