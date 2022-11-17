import { TelemetryEvent } from "../interfaces/telemetry";

export interface AnalyticsEvent {
    userId: string;
    event: string;
    properties?: any;
    measures?: any;
    traits?: any;
    context?: any;
}