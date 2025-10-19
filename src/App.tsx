import { useState, useEffect } from 'react';
import HistoryMap from './components/HistoryMap';
import FilterPanel from './components/FilterPanel';
import Loading from './components/Loading';
import type { HistoricalEvent } from './services/historyApi';
import { fetchHistoricalTimeline, getRandomYear, fetchEventsForYear } from './services/historyApi';
import { cacheEvents, getCachedEvents } from './services/cacheService';
import { geocodeEvents, getCachedGeocodedEvents, cacheGeocodedEvents, type GeocodedEvent } from './services/geocodingService';

function App() {
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [geocodedEvents, setGeocodedEvents] = useState<GeocodedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [yearRange] = useState<[number, number]>([1000, 2024]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Note: Filtering is now handled directly in the HistoryMap component

  const loadEvents = async () => {
    setIsLoading(true);
    console.log('App: Starting to load events...');
    
    // Try to load geocoded events from cache first
    const cachedGeocoded = getCachedGeocodedEvents();
    console.log('App: Cached geocoded events:', cachedGeocoded?.length || 0);
    if (cachedGeocoded && cachedGeocoded.length > 0) {
      console.log('App: Using cached geocoded events');
      setGeocodedEvents(cachedGeocoded);
      setAllEvents(cachedGeocoded);
      extractCategories(cachedGeocoded);
      setIsLoading(false);
      return;
    }
    
    // Try to load regular events from cache
    const cached = getCachedEvents();
    if (cached && cached.length > 0) {
      const geocoded = geocodeEvents(cached);
      setGeocodedEvents(geocoded);
      setAllEvents(cached);
      extractCategories(cached);
      cacheGeocodedEvents(geocoded);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    try {
      console.log('App: Fetching events from API...');
      const events = await fetchHistoricalTimeline();
      console.log('App: Fetched events:', events.length);
      const geocoded = geocodeEvents(events);
      console.log('App: Geocoded events:', geocoded.length);
      setGeocodedEvents(geocoded);
      setAllEvents(events);
      extractCategories(events);
      
      // Cache for next time
      cacheEvents(events);
      cacheGeocodedEvents(geocoded);
      console.log('App: Events loaded and cached successfully');
    } catch (error) {
      console.error('Error loading events:', error);
      console.error('Error details:', error);
      // Set some fallback data to prevent white screen
      const fallbackEvents: HistoricalEvent[] = [{
        year: 1969,
        title: 'Apollo 11 Moon Landing',
        description: 'Neil Armstrong becomes the first person to walk on the Moon.',
        category: 'Science',
        url: 'https://en.wikipedia.org/wiki/Apollo_11'
      }];
      const fallbackGeocoded = geocodeEvents(fallbackEvents);
      setGeocodedEvents(fallbackGeocoded);
      setAllEvents(fallbackEvents);
      extractCategories(fallbackEvents);
    } finally {
      setIsLoading(false);
    }
  };

  const extractCategories = (events: HistoricalEvent[]) => {
    const categories = new Set(events.map(e => e.category));
    setAvailableCategories(Array.from(categories).sort());
    setSelectedCategories(new Set(categories));
  };


  const handleToggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(category)) {
      newSelected.delete(category);
    } else {
      newSelected.add(category);
    }
    setSelectedCategories(newSelected);
  };

  const handleRandomYear = async () => {
    const year = getRandomYear(1000, 2024);
    setIsLoading(true);
    
    try {
      const events = await fetchEventsForYear(year);
      if (events.length > 0) {
        // Add these events to the existing events
        const combinedEvents = [...allEvents, ...events];
        // Remove duplicates based on year + title
        const uniqueEvents = combinedEvents.filter((event, index, self) =>
          index === self.findIndex(e => e.year === event.year && e.title === event.title)
        );
        setAllEvents(uniqueEvents);
        cacheEvents(uniqueEvents);
        
        // Set search to that year
        setSearchTerm(year.toString());
      }
    } catch (error) {
      console.error('Error fetching random year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadEvents();
  };

  if (isLoading && allEvents.length === 0) {
    return <Loading />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative">
      {/* Floating Filter Panel - Responsive */}
      <div className="absolute top-2 left-2 right-2 sm:top-4 sm:left-4 sm:right-auto z-[1000] max-w-xs sm:max-w-sm">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-gray-700/50 shadow-2xl">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
              Time<span className="text-blue-400">Scape</span>
            </h1>
            <p className="text-gray-400 text-xs">
              {allEvents.length.toLocaleString()} events
            </p>
          </div>

          <FilterPanel
            categories={availableCategories}
            selectedCategories={selectedCategories}
            onToggleCategory={handleToggleCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRandomYear={handleRandomYear}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Map - Full Screen */}
      <div className="w-full h-full">
        {geocodedEvents.length > 0 ? (
          <HistoryMap 
            events={geocodedEvents}
            selectedCategories={selectedCategories}
            yearRange={yearRange}
            searchTerm={searchTerm}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-white mb-2">No events found</h2>
              <p className="text-gray-400">Try adjusting your filters or search term</p>
              <button 
                onClick={handleRefresh}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Loading overlay for refreshes */}
      {isLoading && allEvents.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-white mt-4">Loading more events...</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 text-xs text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg px-2 py-1 sm:px-3 sm:py-2 z-[1000]">
        Data from <a href="https://byabbe.se/on-this-day/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">byabbe.se</a> & Wikipedia
      </div>
    </div>
  );
}

export default App;