import { AI_CACHE_SIZE } from '../config';

interface CacheEntry {
  key: string;
  value: string;
  timestamp: number;
}

export class DecisionCache {
  private cache = new Map<string, CacheEntry>();
  private maxSize = AI_CACHE_SIZE;

  buildKey(role: string, state: string, location: string, dayPhase: string): string {
    return `${role}:${state}:${location}:${dayPhase}`;
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    // Expire after 5 minutes
    if (Date.now() - entry.timestamp > 300000) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key: string, value: string): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldest = this.cache.keys().next().value;
      if (oldest !== undefined) {
        this.cache.delete(oldest);
      }
    }
    this.cache.set(key, { key, value, timestamp: Date.now() });
  }
}
