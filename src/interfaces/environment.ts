/**
 * Container object holding environment specific data, used to enrich telemetry events.
 */
export interface Environment {
    /**
     * The extension from which Telemetry events are sent.
     */
    extension: Application,

    /**
     * The client application from which Telemetry events are sent .
     */
    application: Application,

    /**
     * The platform (or OS) from from which Telemetry events are sent.
     */
    platform: Platform,
    /**
     * User timezone, eg. 'Europe/Paris'
     */
    timezone?: string,

    /**
     * The user locale, eg. 'en-US'
     */
    locale?: string,

    /**
     * The user's ISO country code, eg. 'CA' for Canada
     */
    country?: string
}

/**
 * The client application or extension from which Telemetry events are sent.
 */
export interface Application {
    /**
     * Client name
     */
    name: string,
    /**
     * Client version
     */
    version: string
}

/**
 * The platform (or OS) from which Telemetry events are sent.
 */
export interface Platform {
    name: string,
    distribution?: string,
    version?: string
}