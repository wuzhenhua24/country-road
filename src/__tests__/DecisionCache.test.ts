import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config to control TTL/size in tests
vi.mock('../config', () => ({
  AI_CACHE_SIZE: 3,
  AI_CACHE_TTL: 1000, // 1 second for easy testing
}));

import { DecisionCache } from '../ai/DecisionCache';

describe('DecisionCache', () => {
  let cache: DecisionCache;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new DecisionCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('buildKey creates deterministic key', () => {
    const key = cache.buildKey('farmer', 'idle', 'square', 'morning');
    expect(key).toBe('farmer:idle:square:morning');
  });

  it('stores and retrieves a value', () => {
    cache.set('k1', 'v1');
    expect(cache.get('k1')).toBe('v1');
  });

  it('returns null for missing key', () => {
    expect(cache.get('nope')).toBeNull();
  });

  it('expires entries after TTL', () => {
    cache.set('k1', 'v1');
    vi.advanceTimersByTime(1001);
    expect(cache.get('k1')).toBeNull();
  });

  it('refreshes access order on get (LRU)', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    // Access 'a' to refresh it
    cache.get('a');
    // Insert a 4th entry — should evict 'b' (oldest unreferenced)
    cache.set('d', '4');
    expect(cache.get('b')).toBeNull();
    expect(cache.get('a')).toBe('1');
    expect(cache.get('c')).toBe('3');
    expect(cache.get('d')).toBe('4');
  });

  it('evicts oldest entry when at max capacity', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    // At capacity, adding a 4th evicts 'a'
    cache.set('d', '4');
    expect(cache.get('a')).toBeNull();
    expect(cache.get('d')).toBe('4');
  });

  it('overwrites existing key without growing size', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    cache.set('c', '3');
    cache.set('a', 'updated');
    expect(cache.get('a')).toBe('updated');
    // Should still have room — no eviction of b or c
    expect(cache.get('b')).toBe('2');
    expect(cache.get('c')).toBe('3');
  });

  it('prune removes all expired entries', () => {
    cache.set('a', '1');
    cache.set('b', '2');
    vi.advanceTimersByTime(500);
    cache.set('c', '3'); // newer
    vi.advanceTimersByTime(501); // a,b expired; c still valid
    cache.prune();
    expect(cache.get('a')).toBeNull();
    expect(cache.get('b')).toBeNull();
    expect(cache.get('c')).toBe('3');
  });
});
