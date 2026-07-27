import * as assert from 'node:assert';
import { suite, test } from 'vitest';
import type { TelemetryEvent } from '../common/api/telemetry';
import { MAX_QUEUE_SIZE, TelemetryEventQueue } from '../common/impl/telemetryEventQueue';

const dummyEvent: TelemetryEvent = { name: 'test' };

suite('Event Queue Test Suite', () => {
  const queue = new TelemetryEventQueue();
  test('should generate event queue', () => {
    assert.strictEqual(typeof queue.events, typeof []);
  });
  test('should push element in event queue', () => {
    queue.addEvent(dummyEvent);
    assert.strictEqual(queue.events?.length, 1);
  });
  test('should test array limits', () => {
    for (let index = 0; index < MAX_QUEUE_SIZE + 1; index++) {
      queue.addEvent(dummyEvent);
    }
    assert.strictEqual(queue.events?.length, MAX_QUEUE_SIZE);
  });
  test('should destroy the queue', () => {
    queue.emptyQueue();
    assert.strictEqual(queue.events, undefined);
  });
});
