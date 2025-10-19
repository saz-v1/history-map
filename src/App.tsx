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
    
    // Try to load geocoded events from cache first
    const cachedGeocoded = getCachedGeocodedEvents();
    if (cachedGeocoded && cachedGeocoded.length > 0) {
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
      const events = await fetchHistoricalTimeline();
      const geocoded = geocodeEvents(events);
      setGeocodedEvents(geocoded);
      setAllEvents(events);
      extractCategories(events);
      
      // Cache for next time
      cacheEvents(events);
      cacheGeocodedEvents(geocoded);
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
    loadEvents();
  };

  if (isLoading && allEvents.length === 0) {
    return <Loading />;
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-900 relative">
      {/* Floating Filter Panel - Left Side */}
      <div className="absolute top-4 left-4 z-[1000] max-w-xs">
        <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-4 border border-gray-700/50 shadow-2xl">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">
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
      <div className="fixed bottom-4 right-4 text-xs text-gray-400 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 z-[1000]">
        Data from <a href="https://byabbe.se/on-this-day/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">byabbe.se</a> & Wikipedia
      </div>
    </div>
  );
}

export default App;