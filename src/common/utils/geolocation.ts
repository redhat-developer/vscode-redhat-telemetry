import { getTimezone } from 'countries-and-timezones';

export function getCountry(timezone: string): string {
  const tz = getTimezone(timezone);
  if (tz?.countries) {
    return tz.countries[0];
  }
  //Probably UTC timezone
  return 'ZZ'; //Unknown country
}
