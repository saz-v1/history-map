import type { HistoricalEvent } from './historyApi';

// Extended event type with coordinates
export interface GeocodedEvent extends HistoricalEvent {
  latitude: number;
  longitude: number;
}

// Enhanced geocoding database with towns, postcodes, and specific historical locations
const locationDatabase: Record<string, { lat: number; lng: number }> = {
  // UK Cities and Towns
  'london': { lat: 51.5074, lng: -0.1278 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'liverpool': { lat: 53.4084, lng: -2.9916 },
  'leeds': { lat: 53.8008, lng: -1.5491 },
  'sheffield': { lat: 53.3811, lng: -1.4701 },
  'bristol': { lat: 51.4545, lng: -2.5879 },
  'edinburgh': { lat: 55.9533, lng: -3.1883 },
  'glasgow': { lat: 55.8642, lng: -4.2518 },
  'cardiff': { lat: 51.4816, lng: -3.1791 },
  'belfast': { lat: 54.5973, lng: -5.9301 },
  'newcastle': { lat: 54.9783, lng: -1.6178 },
  'nottingham': { lat: 52.9548, lng: -1.1581 },
  'leicester': { lat: 52.6369, lng: -1.1398 },
  'coventry': { lat: 52.4068, lng: -1.5197 },
  'bradford': { lat: 53.7960, lng: -1.7594 },
  'hull': { lat: 53.7676, lng: -0.3274 },
  'plymouth': { lat: 50.3755, lng: -4.1427 },
  'stoke': { lat: 53.0027, lng: -2.1794 },
  'wolverhampton': { lat: 52.5869, lng: -2.1285 },
  'derby': { lat: 52.9225, lng: -1.4746 },
  'swansea': { lat: 51.6214, lng: -3.9436 },
  'southampton': { lat: 50.9097, lng: -1.4044 },
  'salford': { lat: 53.4875, lng: -2.2901 },
  'aberdeen': { lat: 57.1497, lng: -2.0943 },
  'westminster': { lat: 51.4994, lng: -0.1245 },
  'greenwich': { lat: 51.4769, lng: -0.0005 },
  'canterbury': { lat: 51.2802, lng: 1.0789 },
  'york': { lat: 53.9590, lng: -1.0815 },
  'bath': { lat: 51.3811, lng: -2.3590 },
  'oxford': { lat: 51.7520, lng: -1.2577 },
  'cambridge': { lat: 52.2053, lng: 0.1218 },
  'stratford': { lat: 52.1919, lng: -1.7073 },
  'dover': { lat: 51.1279, lng: 1.3134 },
  'portsmouth': { lat: 50.8198, lng: -1.0880 },
  'brighton': { lat: 50.8225, lng: -0.1372 },
  'bournemouth': { lat: 50.7192, lng: -1.8808 },
  'exeter': { lat: 50.7184, lng: -3.5339 },
  'norwich': { lat: 52.6309, lng: 1.2974 },
  'ipswich': { lat: 52.0594, lng: 1.1554 },
  'colchester': { lat: 51.8959, lng: 0.9039 },
  'chelmsford': { lat: 51.7356, lng: 0.4685 },
  'reading': { lat: 51.4543, lng: -0.9781 },
  'luton': { lat: 51.8787, lng: -0.4200 },
  'watford': { lat: 51.6563, lng: -0.3963 },
  'croydon': { lat: 51.3762, lng: -0.0982 },
  'kingston': { lat: 51.4124, lng: -0.3004 },
  'richmond': { lat: 51.4613, lng: -0.3037 },
  'hammersmith': { lat: 51.4920, lng: -0.2237 },
  'chelsea': { lat: 51.4875, lng: -0.1687 },
  'kensington': { lat: 51.5020, lng: -0.1948 },
  'camden': { lat: 51.5390, lng: -0.1426 },
  'islington': { lat: 51.5362, lng: -0.1030 },
  'hackney': { lat: 51.5450, lng: -0.0550 },
  'tower hamlets': { lat: 51.5203, lng: -0.0293 },
  'southwark': { lat: 51.5034, lng: -0.0896 },
  'lambeth': { lat: 51.4952, lng: -0.1200 },
  'wandsworth': { lat: 51.4569, lng: -0.1920 },
  'merton': { lat: 51.4014, lng: -0.1958 },
  'sutton': { lat: 51.3614, lng: -0.1938 },
  'bromley': { lat: 51.4060, lng: 0.0143 },
  'lewisham': { lat: 51.4569, lng: -0.0139 },
  'bexley': { lat: 51.4412, lng: 0.1487 },
  'havering': { lat: 51.5774, lng: 0.2121 },
  'redbridge': { lat: 51.5900, lng: 0.0819 },
  'waltham forest': { lat: 51.5856, lng: -0.0118 },
  'haringey': { lat: 51.5900, lng: -0.1100 },
  'enfield': { lat: 51.6520, lng: -0.0810 },
  'barnet': { lat: 51.6252, lng: -0.1526 },
  'harrow': { lat: 51.5806, lng: -0.3420 },
  'hillingdon': { lat: 51.5350, lng: -0.4480 },
  'ealing': { lat: 51.5150, lng: -0.3080 },
  'brent': { lat: 51.5580, lng: -0.2380 },
  'hammersmith and fulham': { lat: 51.4920, lng: -0.2237 },
  'kensington and chelsea': { lat: 51.5020, lng: -0.1948 },
  'city of london': { lat: 51.5155, lng: -0.0922 },
  'city of westminster': { lat: 51.4994, lng: -0.1245 },

  // European Cities and Towns
  'paris': { lat: 48.8566, lng: 2.3522 },
  'marseille': { lat: 43.2965, lng: 5.3698 },
  'lyon': { lat: 45.7640, lng: 4.8357 },
  'toulouse': { lat: 43.6047, lng: 1.4442 },
  'nice': { lat: 43.7102, lng: 7.2620 },
  'nantes': { lat: 47.2184, lng: -1.5536 },
  'strasbourg': { lat: 48.5734, lng: 7.7521 },
  'montpellier': { lat: 43.6110, lng: 3.8767 },
  'bordeaux': { lat: 44.8378, lng: -0.5792 },
  'lille': { lat: 50.6292, lng: 3.0573 },
  'rennes': { lat: 48.1173, lng: -1.6778 },
  'reims': { lat: 49.2583, lng: 4.0317 },
  'saint-étienne': { lat: 45.4397, lng: 4.3872 },
  'toulon': { lat: 43.1242, lng: 5.9280 },
  'le havre': { lat: 49.4944, lng: 0.1079 },
  'grenoble': { lat: 45.1885, lng: 5.7245 },
  'dijon': { lat: 47.3220, lng: 5.0415 },
  'angers': { lat: 47.4784, lng: -0.5632 },
  'nîmes': { lat: 43.8367, lng: 4.3601 },
  'villeurbanne': { lat: 45.7667, lng: 4.8833 },
  'saint-denis': { lat: 48.9362, lng: 2.3574 },
  'le mans': { lat: 48.0061, lng: 0.1996 },
  'aix-en-provence': { lat: 43.5297, lng: 5.4474 },
  'clermont-ferrand': { lat: 45.7772, lng: 3.0870 },
  'brest': { lat: 48.3905, lng: -4.4860 },
  'tours': { lat: 47.3941, lng: 0.6848 },
  'limoges': { lat: 45.8336, lng: 1.2611 },
  'amiens': { lat: 49.8943, lng: 2.2958 },
  'perpignan': { lat: 42.6886, lng: 2.8948 },
  'metz': { lat: 49.1193, lng: 6.1757 },
  'besançon': { lat: 47.2380, lng: 6.0240 },
  'boulogne-billancourt': { lat: 48.8350, lng: 2.2400 },
  'orléans': { lat: 47.9029, lng: 1.9093 },
  'mulhouse': { lat: 47.7508, lng: 7.3359 },
  'rouen': { lat: 49.4432, lng: 1.0993 },
  'caen': { lat: 49.1829, lng: -0.3707 },
  'nancy': { lat: 48.6921, lng: 6.1844 },
  'saint-pierre': { lat: 46.7811, lng: -56.1764 },
  'argenteuil': { lat: 48.9478, lng: 2.2474 },
  'cergy': { lat: 49.0364, lng: 2.0769 },
  'montreuil': { lat: 48.8612, lng: 2.4432 },
  'nanterre': { lat: 48.8922, lng: 2.2158 },
  'vitry-sur-seine': { lat: 48.7872, lng: 2.3931 },
  'créteil': { lat: 48.7904, lng: 2.4556 },
  'colombes': { lat: 48.9236, lng: 2.2522 },
  'aubervilliers': { lat: 48.9136, lng: 2.3831 },
  'asnières-sur-seine': { lat: 48.9106, lng: 2.2856 },
  'courbevoie': { lat: 48.8967, lng: 2.2567 },
  'rueil-malmaison': { lat: 48.8767, lng: 2.1897 },
  'boulogne-sur-mer': { lat: 50.7260, lng: 1.6137 },
  'fort-de-france': { lat: 14.6037, lng: -61.0732 },
  'saint-paul': { lat: 21.0094, lng: -55.2708 },
  'cayenne': { lat: 4.9224, lng: -52.3135 },
  'papeete': { lat: -17.5350, lng: -149.5696 },
  'nouméa': { lat: -22.2758, lng: 166.4581 },
  
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

// Enhanced location extraction with better pattern matching
function extractLocation(event: HistoricalEvent): { lat: number; lng: number } | null {
  const text = `${event.title} ${event.description}`.toLowerCase();
  
  // Clean up text for better matching
  const cleanText = text
    .replace(/[^\w\s-]/g, ' ') // Remove punctuation except hyphens
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Try exact matches first
  for (const [location, coords] of Object.entries(locationDatabase)) {
    if (cleanText.includes(location.toLowerCase())) {
      return coords;
    }
  }
  
  // Try partial matches for compound locations
  const words = cleanText.split(' ');
  for (const word of words) {
    if (word.length > 3) { // Only check words longer than 3 characters
      for (const [location, coords] of Object.entries(locationDatabase)) {
        if (location.toLowerCase().includes(word) || word.includes(location.toLowerCase())) {
          return coords;
        }
      }
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

