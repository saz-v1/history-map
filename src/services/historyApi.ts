import axios from 'axios';

export interface HistoricalEvent {
  year: number;
  title: string;
  description: string;
  category: string;
  url: string;
  month?: number;
  day?: number;
}

// Request deduplication cache to prevent duplicate API calls
const requestCache = new Map<string, Promise<HistoricalEvent[]>>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cacheTimestamps = new Map<string, number>();

/**
 * Clear expired cache entries
 */
function clearExpiredCache() {
  const now = Date.now();
  for (const [key, timestamp] of cacheTimestamps.entries()) {
    if (now - timestamp > CACHE_DURATION) {
      requestCache.delete(key);
      cacheTimestamps.delete(key);
    }
  }
}

interface WikipediaEvent {
  year: number;
  text: string;
  pages?: Array<{
    title: string;
    content_urls?: {
      desktop?: {
        page: string;
      };
    };
  }>;
}

interface ByAbbeResponse {
  date: string;
  events: Array<{
    year: string;
    description: string;
    wikipedia: Array<{
      title: string;
      wikipedia: string;
    }>;
  }>;
}

// Categories for classification
const CATEGORY_KEYWORDS = {
  Science: ['science', 'discovery', 'space', 'nasa', 'technology', 'invention', 'research', 'nobel', 'physics', 'chemistry', 'biology', 'medicine', 'atom', 'moon', 'mars', 'telescope', 'experiment'],
  Politics: ['war', 'treaty', 'president', 'election', 'government', 'independence', 'revolution', 'battle', 'congress', 'parliament', 'prime minister', 'king', 'queen', 'empire', 'declaration', 'peace', 'military'],
  Culture: ['art', 'music', 'literature', 'film', 'theater', 'novel', 'painting', 'sculpture', 'museum', 'opera', 'symphony', 'exhibition', 'artist', 'writer', 'poet', 'composer'],
  Sports: ['olympic', 'championship', 'world cup', 'athlete', 'record', 'marathon', 'tournament', 'medal', 'soccer', 'football', 'basketball', 'tennis'],
  Technology: ['computer', 'internet', 'software', 'digital', 'electronic', 'robot', 'ai', 'machine', 'patent', 'innovation', 'algorithm'],
  Nature: ['earthquake', 'volcano', 'hurricane', 'tsunami', 'flood', 'disaster', 'meteor', 'comet', 'eclipse', 'climate'],
  Society: ['civil rights', 'protest', 'movement', 'social', 'law', 'court', 'justice', 'reform', 'education', 'university']
};

function categorizeEvent(text: string | null | undefined): string {
  // Handle null/undefined text
  if (!text || typeof text !== 'string') {
    return 'General';
  }
  
  const lowerText = text.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      return category;
    }
  }
  
  return 'General';
}

/**
 * Fetch events from byabbe.se API for a specific date with caching
 */
export async function fetchEventsByDate(month: number, day: number): Promise<HistoricalEvent[]> {
  const cacheKey = `byabbe-${month}-${day}`;
  
  // Check cache first
  clearExpiredCache();
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }
  
  // Create and cache the promise
  const promise = (async () => {
    try {
      const url = `https://byabbe.se/on-this-day/${month}/${day}/events.json`;
      const response = await axios.get<ByAbbeResponse>(url, {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data && response.data.events) {
        return response.data.events
          .filter(event => event && event.description) // Filter out null/undefined events
          .map(event => ({
            year: parseInt(event.year),
            title: event.wikipedia?.[0]?.title || `Event in ${event.year}`,
            description: event.description || '',
            category: categorizeEvent(event.description),
            url: event.wikipedia?.[0]?.wikipedia || '',
            month,
            day,
          }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching events for ${month}/${day}:`, error);
      return [];
    }
  })();
  
  requestCache.set(cacheKey, promise);
  cacheTimestamps.set(cacheKey, Date.now());
  
  return promise;
}

/**
 * Fetch events from Wikipedia's "On This Day" API with caching
 */
export async function fetchWikipediaEvents(month: number, day: number): Promise<HistoricalEvent[]> {
  const cacheKey = `wikipedia-${month}-${day}`;
  
  // Check cache first
  clearExpiredCache();
  if (requestCache.has(cacheKey)) {
    return requestCache.get(cacheKey)!;
  }
  
  // Create and cache the promise
  const promise = (async () => {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/${month}/${day}`;
      const response = await axios.get(url, {
        timeout: 10000, // 10 second timeout
      });
      
      if (response.data && response.data.events) {
        return response.data.events
          .filter((event: WikipediaEvent) => event && event.text) // Filter out null/undefined events
          .map((event: WikipediaEvent) => ({
            year: event.year,
            title: event.pages?.[0]?.title || `Event in ${event.year}`,
            description: event.text || '',
            category: categorizeEvent(event.text),
            url: event.pages?.[0]?.content_urls?.desktop?.page || '',
            month,
            day,
          }));
      }
      
      return [];
    } catch (error) {
      console.error(`Error fetching Wikipedia events for ${month}/${day}:`, error);
      return [];
    }
  })();
  
  requestCache.set(cacheKey, promise);
  cacheTimestamps.set(cacheKey, Date.now());
  
  return promise;
}

/**
 * Fetch events from multiple sources (primary + fallback)
 * Optimized to prefer byabbe.se (smaller payload) and only use Wikipedia as fallback
 */
async function fetchFromMultipleSources(month: number, day: number): Promise<HistoricalEvent[]> {
  const events: HistoricalEvent[] = [];
  
  try {
    // Try byabbe.se first (primary source - smaller payload)
    const byabbeEvents = await fetchEventsByDate(month, day);
    if (byabbeEvents.length > 0) {
      events.push(...byabbeEvents);
      // If we got enough events from byabbe.se, skip Wikipedia to reduce payload
      if (byabbeEvents.length >= 5) {
        return events;
      }
    }
  } catch (error) {
    console.error(`Error fetching from byabbe.se for ${month}/${day}:`, error);
  }
  
  // Only fetch from Wikipedia if we didn't get enough events from byabbe.se
  // This significantly reduces the large Wikipedia payloads
  if (events.length < 5) {
    try {
      const wikipediaEvents = await fetchWikipediaEvents(month, day);
      events.push(...wikipediaEvents);
    } catch (error) {
      console.error(`Error fetching from Wikipedia for ${month}/${day}:`, error);
    }
  }
  
  return events;
}

/**
 * Fetch events for a full year by sampling different dates
 */
export async function fetchEventsForYear(year?: number): Promise<HistoricalEvent[]> {
  const allEvents: HistoricalEvent[] = [];
  
  // Sample 12 dates throughout the year (one per month)
  const datesToFetch = [
    [1, 1], [2, 14], [3, 15], [4, 15], [5, 1], [6, 21],
    [7, 4], [8, 15], [9, 11], [10, 31], [11, 11], [12, 25]
  ];
  
  // Fetch events for each date from multiple sources
  const promises = datesToFetch.map(([month, day]) => 
    fetchFromMultipleSources(month, day)
  );
  
  try {
    const results = await Promise.all(promises);
    results.forEach(events => {
      allEvents.push(...events);
    });
  } catch (error) {
    console.error('Error fetching year events:', error);
  }
  
  // Filter by year if specified
  if (year) {
    return allEvents.filter(event => event.year === year);
  }
  
  return allEvents;
}

/**
 * Fetch a large dataset of historical events by sampling multiple dates
 */
export async function fetchHistoricalTimeline(): Promise<HistoricalEvent[]> {
  const allEvents: HistoricalEvent[] = [];
  
  // Fetch events from various dates throughout the year for diversity
  const monthDayPairs: [number, number][] = [];
  
  // Reduced to 4 days per month to minimize network payloads while maintaining diversity
  // This reduces API calls by ~50% and significantly reduces total payload size
  for (let month = 1; month <= 12; month++) {
    monthDayPairs.push([month, 1]);
    monthDayPairs.push([month, 10]);
    monthDayPairs.push([month, 20]);
    if (month !== 2) {
      monthDayPairs.push([month, 28]);
    } else {
      monthDayPairs.push([month, 15]); // February alternative
    }
  }
  
  // Fetch in larger parallel batches for better performance
  // Increased batch size to process more requests in parallel
  const batchSize = 12; // Increased from 6 to 12 for better parallelism
  const batches: Promise<HistoricalEvent[]>[] = [];
  
  for (let i = 0; i < monthDayPairs.length; i += batchSize) {
    const batch = monthDayPairs.slice(i, i + batchSize);
    const batchPromise = Promise.all(
      batch.map(([month, day]) => fetchFromMultipleSources(month, day))
    ).then(results => {
      const events: HistoricalEvent[] = [];
      results.forEach(eventArray => {
        events.push(...eventArray);
      });
      return events;
    }).catch(error => {
      console.error('Error in batch fetch:', error);
      return [];
    });
    
    batches.push(batchPromise);
  }
  
  // Execute all batches in parallel with controlled concurrency
  // Process 2 batches at a time to balance speed and API limits
  const concurrency = 2;
  for (let i = 0; i < batches.length; i += concurrency) {
    const batchGroup = batches.slice(i, i + concurrency);
    const results = await Promise.all(batchGroup);
    results.forEach(events => {
      allEvents.push(...events);
    });
  }
  
  // Sort by year
  return allEvents.sort((a, b) => a.year - b.year);
}

/**
 * Get a random year between min and max
 */
export function getRandomYear(min: number = 1000, max: number = 2024): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Fetch events for a specific geographic region and time period
 */
export async function fetchEventsForRegion(
  _bounds: { north: number; south: number; east: number; west: number },
  yearRange: [number, number] = [1000, 2024]
): Promise<HistoricalEvent[]> {
  const allEvents: HistoricalEvent[] = [];
  
  // Sample more dates for regional loading to get more events
  const monthDayPairs: [number, number][] = [];
  
  // Sample 4 days per month for regional loading (increased from 2)
  for (let month = 1; month <= 12; month++) {
    monthDayPairs.push([month, 1]);
    monthDayPairs.push([month, 10]);
    monthDayPairs.push([month, 20]);
    monthDayPairs.push([month, Math.min(month + 10, 28)]);
  }
  
  // Fetch events from multiple sources for each date
  const promises = monthDayPairs.map(([month, day]) => fetchFromMultipleSources(month, day));
  
  try {
    const results = await Promise.all(promises);
    results.forEach(events => {
      allEvents.push(...events);
    });
  } catch (error) {
    console.error('Error fetching regional events:', error);
  }
  
  // Filter by year range
  return allEvents.filter(event => 
    event.year >= yearRange[0] && event.year <= yearRange[1]
  );
}

