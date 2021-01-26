import * as os from 'os';
import osLocale from 'os-locale';
import getos from 'getos';
import { LinuxOs } from 'getos';
import { Environment } from '..';
import { env, version} from 'vscode';
export const PLATFORM = getPlatform();
export const DISTRO = getDistribution();
export const PLATFORM_VERSION = os.release();
export const TIMEZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const LOCALE = osLocale.sync().replace('_', '-');
const tuple = LOCALE.split('-');
export const COUNTRY = (tuple.length === 2) ? tuple[1] : '??';


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

function getDistribution(): string|undefined {
    let distro: string|undefined;
    if (os.platform() === 'linux') {
        getos((_e, plat) => {
            let nux = plat as LinuxOs;
            if (nux.dist) {
                distro = nux.dist;
            }
        });
    }
    return distro;
}

export function getEnvironment(extensionId: string, extensionVersion:string): Environment {
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
            distribution: DISTRO
        },
        timezone:TIMEZONE,
        locale:LOCALE,
        country: COUNTRY
    };
}
