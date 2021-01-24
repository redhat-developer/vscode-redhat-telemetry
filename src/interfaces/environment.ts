/**
 * Container object holding environment specific data, used to enrich telemetry events.
 */
export interface Environment {
    /**
     * The client application from which Telemetry events are sent.
     */
    client: Client,

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
 * The client application from which Telemetry events are sent.
 */
export interface Client {
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
    version?: string
}