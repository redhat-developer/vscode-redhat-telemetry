import env, { type Dict } from '../envVar';

/**
 * Returns the locale reported to telemetry.
 *
 * Locale environment variables take precedence, as they did with os-locale:
 * `LC_ALL` > `LC_MESSAGES` > `LANG` > `LANGUAGE`. `LANGUAGE` matters because
 * ICU ignores it. Without any of them, fall back to the OS locale resolved by
 * ICU at process startup. ICU reports `und` when no locale can be determined
 * (e.g. `LANG=""` in a container); fall back to `en-US`, as os-locale 5 did.
 */
export function getLocale(
  localeEnv: Dict<string> = env,
  resolvedLocale: string = new Intl.DateTimeFormat().resolvedOptions().locale,
): string {
  const locale = localeEnv.LC_ALL || localeEnv.LC_MESSAGES || localeEnv.LANG || localeEnv.LANGUAGE;
  if (locale) {
    return normalizeLocale(locale);
  }
  return resolvedLocale === 'und' ? 'en-US' : resolvedLocale;
}

/**
 * Same normalisation as os-locale 8: drop the encoding (`en_US.UTF-8`), the
 * modifier (`sr_RS@latin`) and the colon-separated LANGUAGE list (`fr_FR:de_DE`).
 */
function normalizeLocale(locale: string): string {
  return locale
    .replace(/[.:].*/, '')
    .replace(/@.*/, '')
    .replace(/_/, '-');
}
