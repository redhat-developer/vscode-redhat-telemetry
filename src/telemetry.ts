export interface TelemetryEvent {
    type?: string; // type of telemetry event such as : identify, track, page, etc.
    name: string;
    properties?: any;
    measures?: any;
    traits?: any;
    context?: any;
}

export interface TelemetryService {
    sendStartupEvent(): void;
    send(event: TelemetryEvent): void;
    sendShutdownEvent(): void;
    flushQueue(): void;
    dispose(): void;
}
