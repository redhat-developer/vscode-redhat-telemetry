/**
 * Telemetry Event
 */
export interface TelemetryEvent {
    type?: string; // type of telemetry event such as : identify, track, page, etc.
    name: string;
    properties?: any;
    measures?: any;
    traits?: any;
    context?: any;
}

/**
 * Telemetry Service
 */
export interface TelemetryService {
    /**
     * Sends a `startup` Telemetry event
     */
    sendStartupEvent(): void;
    
    /**
     * Sends the Telemetry event
     */
    send(event: TelemetryEvent): void;
    
    /**
     * Sends a `shutdown` Telemetry event
     */
    sendShutdownEvent(): void;

    /**
     * Flushes the service's Telemetry events queue
     */
    flushQueue(): void;

    /**
     * Dispose this service
     */
    dispose(): void;
}
