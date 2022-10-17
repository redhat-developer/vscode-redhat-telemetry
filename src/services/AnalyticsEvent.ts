import { TelemetryEvent } from "../interfaces/telemetry";

export interface AnalyticsEvent {
    userId: string;
    type?: string; // type of telemetry event such as : identify, track, page, etc.
    event: string;
    properties?: any;
    measures?: any;
    traits?: any;
    context?: any;
}