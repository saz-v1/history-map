import { useState, useEffect, lazy, Suspense } from 'react';
import FilterPanel from './components/FilterPanel';
import Loading from './components/Loading';
import type { HistoricalEvent } from './services/historyApi';
import { fetchHistoricalTimeline, getRandomYear, fetchEventsForYear } from './services/historyApi';
import { cacheEvents, getCachedEvents } from './services/cacheService';
import { geocodeEvents, getCachedGeocodedEvents, cacheGeocodedEvents, type GeocodedEvent } from './services/geocodingService';
import { dynamicLoadingService } from './services/dynamicLoadingService';

// Lazy load the heavy HistoryMap component to reduce initial bundle size
const HistoryMap = lazy(() => import('./components/HistoryMap'));

function App() {
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [geocodedEvents, setGeocodedEvents] = useState<GeocodedEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false); // Start as false - no initial load
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Debounce search input for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [yearRange] = useState<[number, number]>([1000, 2024]);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  // Load minimal cached data on mount (if available) - no API calls
  useEffect(() => {
    loadCachedDataOnly();
  }, []);

  // Load only cached data - no API calls, instant load
  const loadCachedDataOnly = () => {
    // Try to load geocoded events from cache first
    const cachedGeocoded = getCachedGeocodedEvents();
    if (cachedGeocoded && cachedGeocoded.length > 0) {
      // Limit to first 100 events for faster initial render
      const limitedEvents = cachedGeocoded.slice(0, 100);
      setGeocodedEvents(limitedEvents);
      setAllEvents(limitedEvents);
      extractCategories(cachedGeocoded); // Use full categories from cache
      setHasLoadedInitialData(true);
      return;
    }
    
    // Try to load regular events from cache
    const cached = getCachedEvents();
    if (cached && cached.length > 0) {
      const geocoded = geocodeEvents(cached);
      // Limit to first 100 events for faster initial render
      const limitedEvents = geocoded.slice(0, 100);
      setGeocodedEvents(limitedEvents);
      setAllEvents(limitedEvents);
      extractCategories(cached); // Use full categories from cache
      cacheGeocodedEvents(geocoded);
      setHasLoadedInitialData(true);
      return;
    }
    
    // No cache - start with empty map, user can load data manually
    setHasLoadedInitialData(false);
  };

  // Load events from API - only called when user explicitly requests it
  const loadEvents = async () => {
    setIsLoading(true);
    
    try {
      // Fetch a smaller initial dataset - only 2 days per month for faster loading
      const events = await fetchHistoricalTimeline();
      const geocoded = geocodeEvents(events);
      setGeocodedEvents(geocoded);
      setAllEvents(events);
      extractCategories(events);
      
      // Cache for next time
      cacheEvents(events);
      cacheGeocodedEvents(geocoded);
      setHasLoadedInitialData(true);
    } catch (error) {
      console.error('Error loading events:', error);
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
    // Reset dynamic loading service
    dynamicLoadingService.reset();
    // Clear cache and reload
    setGeocodedEvents([]);
    setAllEvents([]);
    loadEvents();
  };

  // Load events when user searches (only if no data loaded yet)
  useEffect(() => {
    if (searchTerm.trim() && searchTerm.length >= 3 && !hasLoadedInitialData && !isLoading) {
      // User is searching - load minimal data
      const timeoutId = setTimeout(() => {
        if (!hasLoadedInitialData && !isLoading) {
          loadEvents();
        }
      }, 800); // Debounce search
      
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  const handleEventsLoaded = (newEvents: GeocodedEvent[]) => {
    // Add new events to existing ones, avoiding duplicates
    setAllEvents(prevEvents => {
      const combined = [...prevEvents, ...newEvents];
      // Remove duplicates based on year + title
      const uniqueEvents = combined.filter((event, index, self) =>
        index === self.findIndex(e => e.year === event.year && e.title === event.title)
      );
      return uniqueEvents;
    });
    
    setGeocodedEvents(prevGeocoded => {
      const combined = [...prevGeocoded, ...newEvents];
      // Remove duplicates based on year + title
      const uniqueEvents = combined.filter((event, index, self) =>
        index === self.findIndex(e => e.year === event.year && e.title === event.title)
      );
      return uniqueEvents;
    });
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
            searchTerm={debouncedSearchTerm}
            onSearchChange={setSearchTerm}
            onRandomYear={handleRandomYear}
            onRefresh={handleRefresh}
            onLoadEvents={loadEvents}
            isLoading={isLoading}
            hasData={hasLoadedInitialData || allEvents.length > 0}
          />
        </div>
      </div>

      {/* Map - Full Screen */}
      <div className="w-full h-full">
        <Suspense fallback={<Loading />}>
          <HistoryMap 
            events={geocodedEvents}
            selectedCategories={selectedCategories}
            yearRange={yearRange}
            searchTerm={debouncedSearchTerm}
            onEventsLoaded={handleEventsLoaded}
          />
        </Suspense>
        {geocodedEvents.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-[500]">
            <div className="text-center max-w-md px-4">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {hasLoadedInitialData ? 'No events found' : 'Explore Historical Events'}
              </h2>
              <p className="text-gray-400 mb-4">
                {hasLoadedInitialData 
                  ? 'Try adjusting your filters or search term'
                  : 'Zoom in on the map, search for events, or click "Load Events" to get started'}
              </p>
              {!hasLoadedInitialData && (
                <button 
                  onClick={loadEvents}
                  disabled={isLoading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? 'Loading Events...' : '📊 Load Events'}
                </button>
              )}
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