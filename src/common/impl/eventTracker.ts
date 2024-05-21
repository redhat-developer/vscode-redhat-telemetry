import { Memento } from "vscode";
import { AnalyticsEvent } from '../api/analyticsEvent';


interface EventTracking {
    lastUpdated: number;
    count: number;
}

export class EventTracker {

    constructor(private globalState: Memento) { }

    async storeEventCount(payload: AnalyticsEvent, newCount: number): Promise<void> {
        const newTracking = {
            count: newCount,
            lastUpdated: this.getTodaysTimestamp()
        } as EventTracking;
        return this.globalState.update(this.getEventTrackingKey(payload.event), newTracking);
    }

    async getEventCount(payload: AnalyticsEvent): Promise<number> {
        const eventTracking = this.globalState.get<EventTracking>(this.getEventTrackingKey(payload.event));
        if (eventTracking) {
            //Check if eventTracking timestamp is older than today
            let today = this.getTodaysTimestamp();
            let lastEventDay = eventTracking.lastUpdated;
            //check if now and lastEventTime are in the same day
            if (lastEventDay === today) {
                return eventTracking.count;
            }
            // new day, reset count
        }
        return 0;
    }

    private getTodaysTimestamp(): number {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now.getTime();
    }
    
    private getEventTrackingKey(eventName: string): string {
        //replace all non alphanumeric characters with a _
        const key = eventName.replace(/[^a-zA-Z0-9]/g, '_');
        return `telemetry.events.tracking.${key}`;
    }
}

