import * as picomatch from "picomatch";
import { isError } from "../utils/events";
import { numValue } from "../utils/hashcode";
import { AnalyticsEvent } from "../api/analyticsEvent";

interface EventNamePattern {
    name: string;
}

interface PropertyPattern {
    property: string;
    value: string;
}

type EventPattern = EventNamePattern | PropertyPattern;

export class Configuration {

    json: any;

    constructor(json: any) {
        this.json = json;
    }

    public isEnabled(): boolean {
        return (this.json?.enabled) === undefined || "off" !== (this.json?.enabled)
    }

    public canSend(event: AnalyticsEvent): boolean {
        if (!this.isEnabled()) {
            return false;
        }
        if ( ["error","crash"].includes(this.json?.enabled) && !isError(event)) {
            return false;
        }

        const ratio = this.getRatio();
        if (ratio < 1.0) {
            const userNumValue = numValue(event.userId);
            if (userNumValue > ratio) {
                return false;
            }
        }

        const isIncluded = this.isIncluded(event) && !this.isExcluded(event);
        return isIncluded;
    }

    isIncluded(event: AnalyticsEvent): boolean {
        const includes = this.getIncludePatterns();
        if (includes.length) {
           return isEventMatching(event, includes);
        }
        return true;
    }

    isExcluded(event: AnalyticsEvent): boolean {
        const excludes = this.getExcludePatterns();
        if (excludes.length) {
           return isEventMatching(event, excludes);
        }
        return false;
    }

    getIncludePatterns(): EventPattern[] {
        if (this.json?.includes) {
            return this.json.includes as EventPattern[];
        }
        return [];
    }

    getExcludePatterns(): EventPattern[] {
        if (this.json.excludes) {
            return this.json.excludes as EventPattern[];
        }
        return [];
    }

    getRatio(): number {
        if (this.json.ratio) {
            try {
                return parseFloat(this.json.ratio);
            } catch(e) {
                // ignore
            }
        }
        return 1.0;
    }

}

function isEventMatching(event: AnalyticsEvent, patterns:EventPattern[]):boolean {
    if (!patterns || !patterns.length) {
        return false;
    }
    const match = patterns.find(evtPtn => {
        if (isPropertyPattern(evtPtn)) {
            const props = event.properties;
            if (props) {
                const value = props[evtPtn.property];
                const propertyPattern = evtPtn.value;
                if (value && picomatch.isMatch(value, propertyPattern)) {
                    return true;
                }
            }
        } else {
            const eventNamePattern = evtPtn.name;
            if (eventNamePattern && event.event && picomatch.isMatch(event.event, eventNamePattern)) {
                return true;
            }
        }
        return false;
    });
    return !!match;
}


function isPropertyPattern(event: EventPattern): event is PropertyPattern {
    if ((event as PropertyPattern).property) {
        return true
    }
    return false
}