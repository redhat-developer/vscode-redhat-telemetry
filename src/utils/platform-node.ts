import * as os from 'os';
import osLocale from 'os-locale';
import getos from 'getos';
import { LinuxOs } from 'getos';
import { Environment } from '..';
import { env, version} from 'vscode';
import { promisify } from 'util';
import { getTimezone } from 'countries-and-timezones';

export const PLATFORM = getPlatform();
export const DISTRO = getDistribution();
export const PLATFORM_VERSION = os.release();
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const LOCALE = osLocale.sync().replace('_', '-');
export const COUNTRY = getCountry(TIMEZONE);

function getCountry(timezone: string): string {
    const tz = getTimezone(timezone);
    if (tz && tz?.country) {
        return tz.country;
    }
    //Probably UTC timezone
    return 'ZZ'; //Unknown country
} 

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
async function getDistribution(): Promise<string|undefined> {
    if (os.platform() === 'linux') {
      const platorm = await promisify(getos)() as LinuxOs;
      return platorm.dist;
    }
    return undefined;
}

export async function getEnvironment(extensionId: string, extensionVersion:string): Promise<Environment> {
    return {
        extension: {
            name:extensionId,
            version:extensionVersion,
        },
        application: {
            name: env.appName,
            version: version,
        },
        platform:{
            name:PLATFORM,
            version:PLATFORM_VERSION,
            distribution: await DISTRO
        },
        timezone:TIMEZONE,
        locale:LOCALE,
        country: COUNTRY
    };
}
