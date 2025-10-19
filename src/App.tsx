import { useState, useEffect } from 'react';
import Timeline from './components/Timeline';
import FilterPanel from './components/FilterPanel';
import Loading from './components/Loading';
import type { HistoricalEvent } from './services/historyApi';
import { fetchHistoricalTimeline, getRandomYear, fetchEventsForYear } from './services/historyApi';
import { cacheEvents, getCachedEvents } from './services/cacheService';

function App() {
  const [allEvents, setAllEvents] = useState<HistoricalEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoricalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load events on mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Filter events when search or categories change
  useEffect(() => {
    filterEvents();
  }, [searchTerm, selectedCategories, allEvents]);

  const loadEvents = async () => {
    setIsLoading(true);
    
    // Try to load from cache first
    const cached = getCachedEvents();
    if (cached && cached.length > 0) {
      console.log('Loaded from cache:', cached.length, 'events');
      setAllEvents(cached);
      extractCategories(cached);
      setIsLoading(false);
      return;
    }

    // Fetch from API
    try {
      const events = await fetchHistoricalTimeline();
      console.log('Fetched from API:', events.length, 'events');
      setAllEvents(events);
      extractCategories(events);
      
      // Cache for next time
      cacheEvents(events);
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

  const filterEvents = () => {
    let filtered = allEvents;

    // Filter by category
    if (selectedCategories.size > 0) {
      filtered = filtered.filter(event => selectedCategories.has(event.category));
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term) ||
        event.year.toString().includes(term)
      );
    }

    setFilteredEvents(filtered);
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
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
            Time<span className="text-blue-400">Scape</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Explore {allEvents.length.toLocaleString()} events across history
            {filteredEvents.length !== allEvents.length && ` (${filteredEvents.length.toLocaleString()} shown)`}
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

      {/* Timeline */}
      <div className="w-full h-full pt-56">
        {filteredEvents.length > 0 ? (
          <Timeline events={filteredEvents} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">🔍</div>
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

      {/* Instructions */}
      <div className="fixed bottom-4 left-4 bg-gray-800/80 rounded-lg p-3 text-xs text-gray-400 max-w-xs">
        <p className="mb-1"><strong className="text-white">💡 Tips:</strong></p>
        <p>• Scroll to zoom in/out</p>
        <p>• Drag to pan the timeline</p>
        <p>• Hover over events for details</p>
        <p>• Click events to read more</p>
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 right-4 text-xs text-gray-500">
        Data from <a href="https://byabbe.se/on-this-day/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">byabbe.se</a> & Wikipedia
      </div>
    </div>
  );
}

export default App;