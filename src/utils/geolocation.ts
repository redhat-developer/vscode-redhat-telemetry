
import { getTimezone } from 'countries-and-timezones';
export function getCountry(timezone: string): string {
    const tz = getTimezone(timezone);
    if (tz && tz?.country) {
        return tz.country;
    }
    //Probably UTC timezone
    return 'ZZ'; //Unknown country
} 