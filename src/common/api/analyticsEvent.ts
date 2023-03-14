export interface AnalyticsEvent {
    userId: string;
    event: string;
    type: string;
    properties?: any;
    measures?: any;
    traits?: any;
    context?: any;
}