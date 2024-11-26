import * as picomatch from "picomatch";
import { isError } from "../utils/events";
import { numValue } from "../utils/hashcode";
import { AnalyticsEvent } from "../api/analyticsEvent";

interface EventNamePattern {
    name: string;
    ratio?: string;
    dailyLimit?: string;
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

        const currUserRatioValue = numValue(event.userId);
        const configuredRatio = getRatio(this.json?.ratio);
        if (configuredRatio === 0 || configuredRatio < currUserRatioValue) {
            return false;
        }

        const isIncluded = this.isIncluded(event, currUserRatioValue)
                        && !this.isExcluded(event, currUserRatioValue)
        return isIncluded;
    }

    public getDailyLimit(event: AnalyticsEvent): number {
        const includes = this.getIncludePatterns();
        if (includes.length) {
            const pattern = includes.filter(isEventNamePattern).map(p => p as EventNamePattern)
            .find(p => picomatch.isMatch(event.event, p.name))
            if (pattern?.dailyLimit) {
                try {
                    return parseInt(pattern.dailyLimit);
                } catch(e) {
                    // ignore
                }
            }
        }
        return Number.MAX_VALUE;
    }

    isIncluded(event: AnalyticsEvent, currUserRatioValue: number): boolean {
        const includes = this.getIncludePatterns();
        if (includes.length) {
            return this.isEventMatching(event, includes, currUserRatioValue, true);
        }
        return true;
    }

    isExcluded(event: AnalyticsEvent, currUserRatioValue: number): boolean {
        const excludes = this.getExcludePatterns();
        if (excludes.length) {
            return this.isEventMatching(event, excludes, currUserRatioValue, false);
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
        if (this.json?.excludes) {
            return this.json.excludes as EventPattern[];
        }
        return [];
    }

    isEventMatching(event: AnalyticsEvent, patterns:EventPattern[], currUserRatioValue: number, including: boolean):boolean {
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
                    const configuredEventRatio = getRatio(evtPtn?.ratio);
                    if (including) {
                        return currUserRatioValue <= configuredEventRatio;
                    }
                    // excluding 90% of user means keeping 10%
                    // so user ratio value of 0.11 should be excluded (i.e match) when excluded event ratio = 0.9
                    return currUserRatioValue > 1 - configuredEventRatio;
                }
            }
            return false;
        });
        return !!match;
    }
}

function getRatio(ratioAsString ?:string): number {
    if (ratioAsString) {
        try {
            return parseFloat(ratioAsString);
        } catch(e) {
            // ignore
        }
    }
    return 1.0;
}

function isPropertyPattern(event: EventPattern): event is PropertyPattern {
    if ((event as PropertyPattern).property) {
        return true
    }
    return false
}

function isEventNamePattern(event: EventPattern): event is EventNamePattern {
    if ((event as EventNamePattern).name) {
        return true
    }
    return false
}
