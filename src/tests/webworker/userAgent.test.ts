import assert from 'node:assert';
import { suite, test } from 'vitest';
import { parseUserAgent } from '../../webworker/userAgent';

const userAgents = {
  windows10:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  windows11Edge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 Edg/126.0.2592.87',
  windows7:
    'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
  windowsXP: 'Mozilla/5.0 (Windows XP; rv:52.0) Gecko/20100101 Firefox/52.0',
  windowsPhone:
    'Mozilla/5.0 (Mobile; Windows Phone 8.1; Android 4.0; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 635) like iPhone OS 7_0_3 Mac OS X AppleWebKit/537 (KHTML, like Gecko) Mobile Safari/537',
  internetExplorer11: 'Mozilla/5.0 (Windows NT 10.0; WOW64; Trident/7.0; rv:11.0) like Gecko',
  macos:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  ubuntu: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  openSUSE: 'Mozilla/5.0 (X11; openSUSE; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  suse: 'Mozilla/5.0 (X11; SUSE; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  arch: 'Mozilla/5.0 (X11; Arch Linux; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  aarch64: 'Mozilla/5.0 (X11; Linux aarch64; rv:127.0) Gecko/20100101 Firefox/127.0',
  linuxMint: 'Mozilla/5.0 (X11; Linux Mint; Linux x86_64; rv:127.0) Gecko/20100101 Firefox/127.0',
  chromeOS:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  androidTablet:
    'Mozilla/5.0 (Linux; Android 14; SM-X710) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  androidFirefox: 'Mozilla/5.0 (Android 14; Mobile; rv:127.0) Gecko/127.0 Firefox/127.0',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  freebsd: 'Mozilla/5.0 (X11; FreeBSD amd64; rv:127.0) Gecko/20100101 Firefox/127.0',
  unknown: 'FooBar/1.0',
  empty: '',
} as const;

interface PlatformCase {
  label: string;
  userAgent: string;
  name: string;
  version?: string;
  distribution?: string;
}

const platformCases: PlatformCase[] = [
  { label: 'Windows 10', userAgent: userAgents.windows10, name: 'Windows', version: '10' },
  { label: 'Windows 11 (reported as NT 10.0)', userAgent: userAgents.windows11Edge, name: 'Windows', version: '10' },
  { label: 'Windows 7 (reported as NT 6.1)', userAgent: userAgents.windows7, name: 'Windows', version: '7' },
  { label: 'Windows XP', userAgent: userAgents.windowsXP, name: 'Windows', version: 'XP' },
  {
    label: 'Windows Phone',
    userAgent: userAgents.windowsPhone,
    name: 'Windows',
    version: '8.1',
  },
  { label: 'macOS', userAgent: userAgents.macos, name: 'Mac', version: '10.15.7' },
  { label: 'Ubuntu', userAgent: userAgents.ubuntu, name: 'Linux', distribution: 'Ubuntu' },
  {
    label: 'openSUSE is not reported as SUSE',
    userAgent: userAgents.openSUSE,
    name: 'Linux',
    distribution: 'openSUSE',
  },
  { label: 'SUSE', userAgent: userAgents.suse, name: 'Linux', distribution: 'SUSE' },
  { label: 'Arch', userAgent: userAgents.arch, name: 'Linux', distribution: 'Arch' },
  { label: 'aarch64 is not Arch', userAgent: userAgents.aarch64, name: 'Linux', distribution: 'Linux' },
  { label: 'Linux Mint', userAgent: userAgents.linuxMint, name: 'Linux', distribution: 'Linux Mint' },
  {
    label: 'Chrome OS',
    userAgent: userAgents.chromeOS,
    name: 'Linux',
    version: '14541.0.0',
    distribution: 'Chrome OS',
  },
  { label: 'Android', userAgent: userAgents.android, name: 'Unknown', version: '14', distribution: 'Android' },
  { label: 'iOS', userAgent: userAgents.ios, name: 'Unknown', version: '17.5', distribution: 'iOS' },
  { label: 'FreeBSD', userAgent: userAgents.freebsd, name: 'BSD', distribution: 'FreeBSD' },
  { label: 'unknown user agent', userAgent: userAgents.unknown, name: 'Unknown' },
  { label: 'empty user agent', userAgent: userAgents.empty, name: 'Unknown' },
];

suite('parseUserAgent platform', () => {
  for (const { label, userAgent, name, version, distribution } of platformCases) {
    test(label, () => {
      const { platform } = parseUserAgent(userAgent);
      assert.strictEqual(platform.name, name);
      assert.strictEqual(platform.version, version);
      assert.strictEqual(platform.distribution, distribution);
    });
  }
});

interface BrowserCase {
  label: string;
  userAgent: string;
  name?: string;
  version?: string;
}

const browserCases: BrowserCase[] = [
  { label: 'Edge is not Microsoft Edge', userAgent: userAgents.windows11Edge, name: 'Edge', version: '126.0.2592.87' },
  { label: 'IE is not Internet Explorer', userAgent: userAgents.internetExplorer11, name: 'IE', version: '11.0' },
  { label: 'Windows Phone uses IEMobile', userAgent: userAgents.windowsPhone, name: 'IEMobile', version: '11.0' },
  { label: 'iOS Safari is Mobile Safari', userAgent: userAgents.ios, name: 'Mobile Safari', version: '17.5' },
  {
    label: 'Android Chrome is Mobile Chrome',
    userAgent: userAgents.android,
    name: 'Mobile Chrome',
    version: '126.0.0.0',
  },
  {
    label: 'Android tablet Chrome is not mobile',
    userAgent: userAgents.androidTablet,
    name: 'Chrome',
    version: '126.0.0.0',
  },
  {
    label: 'Android Firefox is Mobile Firefox',
    userAgent: userAgents.androidFirefox,
    name: 'Mobile Firefox',
    version: '127.0',
  },
  { label: 'macOS Safari is not mobile', userAgent: userAgents.macos, name: 'Safari', version: '17.5' },
  { label: 'unknown user agent', userAgent: userAgents.unknown },
  { label: 'empty user agent', userAgent: userAgents.empty },
];

suite('parseUserAgent browser', () => {
  for (const { label, userAgent, name, version } of browserCases) {
    test(label, () => {
      const { browser } = parseUserAgent(userAgent);
      assert.strictEqual(browser.name, name);
      assert.strictEqual(browser.version, version);
    });
  }
});
