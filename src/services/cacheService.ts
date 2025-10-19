import type { HistoricalEvent } from './historyApi';

const CACHE_KEY = 'timescape_events_cache';
const CACHE_TIMESTAMP_KEY = 'timescape_cache_timestamp';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface CacheData {
  events: HistoricalEvent[];
  timestamp: number;
}

/**
 * Save events to local storage
 */
export function cacheEvents(events: HistoricalEvent[]): void {
  try {
    const cacheData: CacheData = {
      events,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Error caching events:', error);
  }
}

/**
 * Retrieve cached events if they're still valid
 */
export function getCachedEvents(): HistoricalEvent[] | null {
  try {
    const cachedDataStr = localStorage.getItem(CACHE_KEY);
    if (!cachedDataStr) {
      return null;
    }

    const cacheData: CacheData = JSON.parse(cachedDataStr);
    const now = Date.now();
    
    // Check if cache is still valid (not expired)
    if (now - cacheData.timestamp < CACHE_DURATION) {
      return cacheData.events;
    }
    
    // Cache expired, clear it
    clearCache();
    return null;
  } catch (error) {
    console.error('Error retrieving cached events:', error);
    return null;
  }
}

/**
 * Check if cache exists and is valid
 */
export function isCacheValid(): boolean {
  try {
    const cachedDataStr = localStorage.getItem(CACHE_KEY);
    if (!cachedDataStr) {
      return false;
    }

    const cacheData: CacheData = JSON.parse(cachedDataStr);
    const now = Date.now();
    
    return now - cacheData.timestamp < CACHE_DURATION;
  } catch (error) {
    return false;
  }
}

/**
 * Clear the cache
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache age in hours
 */
export function getCacheAge(): number | null {
  try {
    const cachedDataStr = localStorage.getItem(CACHE_KEY);
    if (!cachedDataStr) {
      return null;
    }

    const cacheData: CacheData = JSON.parse(cachedDataStr);
    const now = Date.now();
    const ageInHours = (now - cacheData.timestamp) / (1000 * 60 * 60);
    
    return Math.round(ageInHours);
  } catch (error) {
    return null;
  }
}

