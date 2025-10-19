import type { HistoricalEvent } from './historyApi';

// Extended event type with coordinates
export interface GeocodedEvent extends HistoricalEvent {
  latitude: number;
  longitude: number;
}

// Simple geocoding based on common historical locations
// In a real app, you'd use a proper geocoding API
const locationDatabase: Record<string, { lat: number; lng: number }> = {
  // Major cities
  'london': { lat: 51.5074, lng: -0.1278 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'athens': { lat: 37.9838, lng: 23.7275 },
  'constantinople': { lat: 41.0082, lng: 28.9784 },
  'istanbul': { lat: 41.0082, lng: 28.9784 },
  'moscow': { lat: 55.7558, lng: 37.6173 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'vienna': { lat: 48.2082, lng: 16.3738 },
  'madrid': { lat: 40.4168, lng: -3.7038 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'brussels': { lat: 50.8503, lng: 4.3517 },
  'warsaw': { lat: 52.2297, lng: 21.0122 },
  'prague': { lat: 50.0755, lng: 14.4378 },
  'budapest': { lat: 47.4979, lng: 19.0402 },
  
  // Americas
  'new york': { lat: 40.7128, lng: -74.0060 },
  'washington': { lat: 38.9072, lng: -77.0369 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'havana': { lat: 23.1136, lng: -82.3666 },
  'rio de janeiro': { lat: -22.9068, lng: -43.1729 },
  'buenos aires': { lat: -34.6037, lng: -58.3816 },
  'lima': { lat: -12.0464, lng: -77.0428 },
  
  // Asia
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'delhi': { lat: 28.7041, lng: 77.1025 },
  'mumbai': { lat: 19.0760, lng: 72.8777 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'bangkok': { lat: 13.7563, lng: 100.5018 },
  'seoul': { lat: 37.5665, lng: 126.9780 },
  'manila': { lat: 14.5995, lng: 120.9842 },
  'jakarta': { lat: -6.2088, lng: 106.8456 },
  'baghdad': { lat: 33.3152, lng: 44.3661 },
  'tehran': { lat: 35.6892, lng: 51.3890 },
  'jerusalem': { lat: 31.7683, lng: 35.2137 },
  'damascus': { lat: 33.5138, lng: 36.2765 },
  'cairo': { lat: 30.0444, lng: 31.2357 },
  
  // Africa
  'cape town': { lat: -33.9249, lng: 18.4241 },
  'johannesburg': { lat: -26.2041, lng: 28.0473 },
  'nairobi': { lat: -1.2864, lng: 36.8172 },
  'lagos': { lat: 6.5244, lng: 3.3792 },
  'casablanca': { lat: 33.5731, lng: -7.5898 },
  'algiers': { lat: 36.7538, lng: 3.0588 },
  'tunis': { lat: 36.8065, lng: 10.1815 },
  
  // Oceania
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'melbourne': { lat: -37.8136, lng: 144.9631 },
  'auckland': { lat: -36.8485, lng: 174.7633 },
  
  // Countries (use capital as default)
  'england': { lat: 51.5074, lng: -0.1278 },
  'france': { lat: 48.8566, lng: 2.3522 },
  'germany': { lat: 52.5200, lng: 13.4050 },
  'italy': { lat: 41.9028, lng: 12.4964 },
  'spain': { lat: 40.4168, lng: -3.7038 },
  'russia': { lat: 55.7558, lng: 37.6173 },
  'china': { lat: 39.9042, lng: 116.4074 },
  'japan': { lat: 35.6762, lng: 139.6503 },
  'india': { lat: 28.7041, lng: 77.1025 },
  'usa': { lat: 38.9072, lng: -77.0369 },
  'united states': { lat: 38.9072, lng: -77.0369 },
  'america': { lat: 38.9072, lng: -77.0369 },
  'canada': { lat: 45.4215, lng: -75.6972 },
  'mexico': { lat: 19.4326, lng: -99.1332 },
  'brazil': { lat: -15.8267, lng: -47.9218 },
  'australia': { lat: -35.2809, lng: 149.1300 },
  'egypt': { lat: 30.0444, lng: 31.2357 },
  'south africa': { lat: -25.7479, lng: 28.2293 },
  
  // Historical regions
  'persia': { lat: 35.6892, lng: 51.3890 },
  'ottoman empire': { lat: 41.0082, lng: 28.9784 },
  'holy roman empire': { lat: 48.2082, lng: 16.3738 },
  'byzantine empire': { lat: 41.0082, lng: 28.9784 },
  'roman empire': { lat: 41.9028, lng: 12.4964 },
  'ancient greece': { lat: 37.9838, lng: 23.7275 },
  'mesopotamia': { lat: 33.3152, lng: 44.3661 },
};

// Extract location from event description
function extractLocation(event: HistoricalEvent): { lat: number; lng: number } | null {
  const text = `${event.title} ${event.description}`.toLowerCase();
  
  // Try to find any known location in the text
  for (const [location, coords] of Object.entries(locationDatabase)) {
    if (text.includes(location)) {
      return coords;
    }
  }
  
  return null;
}

// Assign random coordinates if no location found (for demo purposes)
function getRandomCoordinates(): { lat: number; lng: number } {
  // Bias towards populated areas
  const regions = [
    { lat: 51, lng: 10, radius: 20 },  // Europe
    { lat: 35, lng: 105, radius: 30 }, // Asia
    { lat: 40, lng: -100, radius: 25 }, // North America
    { lat: -15, lng: -50, radius: 20 }, // South America
    { lat: 0, lng: 20, radius: 25 },   // Africa
  ];
  
  const region = regions[Math.floor(Math.random() * regions.length)];
  
  return {
    lat: region.lat + (Math.random() - 0.5) * region.radius,
    lng: region.lng + (Math.random() - 0.5) * region.radius,
  };
}

export function geocodeEvents(events: HistoricalEvent[]): GeocodedEvent[] {
  return events.map(event => {
    const location = extractLocation(event) || getRandomCoordinates();
    
    return {
      ...event,
      latitude: location.lat,
      longitude: location.lng,
    };
  });
}

// Cache geocoded events
const GEOCODE_CACHE_KEY = 'timescape_geocoded_events';

export function getCachedGeocodedEvents(): GeocodedEvent[] | null {
  try {
    const cached = localStorage.getItem(GEOCODE_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error loading geocoded events from cache:', error);
  }
  return null;
}

export function cacheGeocodedEvents(events: GeocodedEvent[]): void {
  try {
    localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Error caching geocoded events:', error);
  }
}

