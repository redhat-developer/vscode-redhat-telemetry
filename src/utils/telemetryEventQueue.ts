import { TelemetryEvent } from '../interfaces/telemetry';

export const MAX_QUEUE_SIZE = 35;

export class TelemetryEventQueue {
  events: TelemetryEvent[] | undefined;

  constructor() {
    this.events = [];
  }

  /*
    shift() should work fine until we choose to have high MAX_QUEUE_SIZE
   */
  public addEvent(e: TelemetryEvent) {
    if (this.events?.length === MAX_QUEUE_SIZE) {
      this.events.shift();
    }
    this.events?.push(e);
  }

  public emptyQueue() {
    this.events = undefined;
  }
}
