import { AI_CACHE_SIZE, AI_CACHE_TTL } from '../config';

interface CacheEntry {
  value: string;
  timestamp: number;
}

export class DecisionCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = AI_CACHE_SIZE;
  private ttl = AI_CACHE_TTL;

  buildKey(role: string, state: string, location: string, dayPhase: string): string {
    return `${role}:${state}:${location}:${dayPhase}`;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    // Move to end (refresh access order)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: string): void {
    // Delete first so re-insertion moves it to end
    this.cache.delete(key);
    if (this.cache.size >= this.maxSize) {
      // Evict oldest (first entry in Map iteration order)
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  /** Remove all expired entries */
  prune(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }
}
