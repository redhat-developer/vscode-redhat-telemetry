import { AnalyticsEvent } from "./analyticsEvent"
export interface IReporter {
    report(event: AnalyticsEvent): Promise<void>

    flush(): Promise<void>;

    closeAndFlush(): Promise<void>;
}