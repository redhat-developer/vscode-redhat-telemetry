import * as assert from 'node:assert';
import { suite, test } from 'vitest';
import type { AnalyticsEvent } from '../common/api/analyticsEvent';
import type { CacheService } from '../common/api/cacheService';
import { Reporter } from '../common/impl/reporter';

class MockCacheService implements CacheService {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | undefined> {
    return this.store.get(key);
  }

  async put(key: string, value: string): Promise<boolean> {
    this.store.set(key, value);
    return true;
  }

  keys(): string[] {
    return Array.from(this.store.keys());
  }
}

class MockAnalytics {
  identifyCalls: AnalyticsEvent[] = [];
  async identify(event: AnalyticsEvent): Promise<void> {
    this.identifyCalls.push(event);
  }
  async track(): Promise<void> {}
  async page(): Promise<void> {}
}

const identifyEvent: AnalyticsEvent = { type: 'identify', userId: 'user1', traits: { name: 'Test' } } as any;

suite('Reporter identify caching', () => {
  test('sends identify on first call', async () => {
    const analytics = new MockAnalytics();
    const cache = new MockCacheService();
    const reporter = new Reporter(analytics as any, cache, 'key-abc');

    await reporter.report(identifyEvent);

    assert.strictEqual(analytics.identifyCalls.length, 1);
  });

  test('skips duplicate identify with identical payload', async () => {
    const analytics = new MockAnalytics();
    const cache = new MockCacheService();
    const reporter = new Reporter(analytics as any, cache, 'key-abc');

    await reporter.report(identifyEvent);
    await reporter.report(identifyEvent);

    assert.strictEqual(analytics.identifyCalls.length, 1);
  });

  test('resends identify when traits change', async () => {
    const analytics = new MockAnalytics();
    const cache = new MockCacheService();
    const reporter = new Reporter(analytics as any, cache, 'key-abc');
    const updatedEvent: AnalyticsEvent = { type: 'identify', userId: 'user1', traits: { name: 'Updated' } } as any;

    await reporter.report(identifyEvent);
    await reporter.report(updatedEvent);

    assert.strictEqual(analytics.identifyCalls.length, 2);
  });

  test('uses per-source cache keys — different writeKeys do not share cache', async () => {
    const analyticsA = new MockAnalytics();
    const analyticsB = new MockAnalytics();
    const cache = new MockCacheService();

    const reporterA = new Reporter(analyticsA as any, cache, 'key-ext-a');
    const reporterB = new Reporter(analyticsB as any, cache, 'key-ext-b');

    await reporterA.report(identifyEvent);
    // reporterB has a different writeKey so its cache entry is independent.
    await reporterB.report(identifyEvent);

    assert.strictEqual(analyticsA.identifyCalls.length, 1);
    assert.strictEqual(analyticsB.identifyCalls.length, 1);
    assert.ok(cache.keys().includes('key-ext-a-identify'));
    assert.ok(cache.keys().includes('key-ext-b-identify'));
  });

  test('falls back to "identify" cache key when writeKey is undefined', async () => {
    const analytics = new MockAnalytics();
    const cache = new MockCacheService();
    const reporter = new Reporter(analytics as any, cache, undefined);

    await reporter.report(identifyEvent);

    assert.ok(cache.keys().includes('identify'));
    assert.ok(!cache.keys().some((k) => k.startsWith('undefined')));
  });

  test('skips send when no analytics instance provided', async () => {
    const cache = new MockCacheService();
    const reporter = new Reporter(undefined, cache, 'key-abc');

    // Should not throw and cache should remain empty.
    await reporter.report(identifyEvent);
    assert.strictEqual(cache.keys().length, 0);
  });
});
