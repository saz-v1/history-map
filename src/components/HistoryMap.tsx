import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from './MarkerClusterGroup';
import type { GeocodedEvent } from '../services/geocodingService';
import { dynamicLoadingService, type MapBounds } from '../services/dynamicLoadingService';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configure Leaflet to use CDN for default icons
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface HistoryMapProps {
  events: GeocodedEvent[];
  selectedCategories: Set<string>;
  yearRange: [number, number];
  searchTerm?: string;
  onEventsLoaded?: (newEvents: GeocodedEvent[]) => void;
}

// Component to handle map updates and dynamic loading
function MapUpdater({ 
  events, 
  yearRange, 
  onEventsLoaded,
  onMapMove
}: { 
  events: GeocodedEvent[];
  yearRange: [number, number];
  onEventsLoaded?: (newEvents: GeocodedEvent[]) => void;
  onMapMove?: (bounds?: L.LatLngBounds) => void;
}) {
  const map = useMap();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const hasInitialBounds = React.useRef(false);
  const userHasInteracted = React.useRef(false);
  const isFirstLoad = React.useRef(true);
  
  // Only fit bounds on the VERY FIRST load - never again after user interaction
  useEffect(() => {
    // Only auto-fit bounds on the absolute first load when we have events
    // Once user interacts, NEVER auto-fit again
    if (isFirstLoad.current && events.length > 0 && !userHasInteracted.current && !hasInitialBounds.current) {
      const bounds = events.map(e => [e.latitude, e.longitude] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 5,
          animate: true
        });
        hasInitialBounds.current = true;
        isFirstLoad.current = false;
      }
    } else if (events.length > 0) {
      // Mark that we've loaded data (even if we didn't fit bounds)
      isFirstLoad.current = false;
    }
  }, [events, map]);

  // Handle map movement for dynamic loading
  const handleMapMoveInternal = useCallback(() => {
    // Mark that user has interacted with the map
    userHasInteracted.current = true;
    
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
    // Notify parent component of map movement
    if (onMapMove) {
      onMapMove(bounds);
    }
    
    // Lower the minimum zoom level to trigger loading earlier
    // This makes the map more responsive to user interaction
    if (zoom >= 1) { // Lowered from 2 to 1
      const mapBounds: MapBounds = {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      };

      // Check if we should load more events
      if (dynamicLoadingService.shouldLoadEvents(mapBounds, zoom)) {
        dynamicLoadingService.loadEventsForRegion(
          mapBounds,
          yearRange,
          (newEvents) => {
            if (onEventsLoaded && newEvents.length > 0) {
              onEventsLoaded(newEvents);
            }
          },
          setIsLoadingMore
        );
      }
    }
  }, [map, yearRange, onEventsLoaded, onMapMove]);

  // Handle user interactions (click, drag, zoom) to prevent auto-reset
  useEffect(() => {
    const handleUserInteraction = () => {
      // Mark that user has interacted - this prevents ANY future auto-fit bounds
      userHasInteracted.current = true;
      isFirstLoad.current = false; // Also mark that first load is done
    };

    // Track all possible user interactions
    map.on('moveend', handleMapMoveInternal);
    map.on('zoomend', handleMapMoveInternal);
    map.on('click', handleUserInteraction);
    map.on('dragstart', handleUserInteraction);
    map.on('zoomstart', handleUserInteraction);
    map.on('mousedown', handleUserInteraction); // Track mouse down for dragging
    map.on('touchstart', handleUserInteraction); // Track touch for mobile
    map.on('wheel', handleUserInteraction); // Track scroll wheel zoom

    return () => {
      map.off('moveend', handleMapMoveInternal);
      map.off('zoomend', handleMapMoveInternal);
      map.off('click', handleUserInteraction);
      map.off('dragstart', handleUserInteraction);
      map.off('zoomstart', handleUserInteraction);
      map.off('mousedown', handleUserInteraction);
      map.off('touchstart', handleUserInteraction);
      map.off('wheel', handleUserInteraction);
    };
  }, [map, handleMapMoveInternal]);
  
  return (
    <>
      {isLoadingMore && (
        <div className="absolute top-4 right-4 z-[1000] bg-gray-900/90 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
          <div className="flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            Loading more events...
          </div>
        </div>
      )}
    </>
  );
}

const HistoryMap: React.FC<HistoryMapProps> = ({ 
  events, 
  selectedCategories, 
  yearRange, 
  searchTerm = '', 
  onEventsLoaded 
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | null>(null);
  
  // Component to get map instance and track bounds
  function MapBoundsTracker({ onBoundsChange }: { onBoundsChange: (bounds: L.LatLngBounds) => void }) {
    const map = useMap();
    
    useEffect(() => {
      const updateBounds = () => {
        onBoundsChange(map.getBounds());
      };
      
      updateBounds();
      map.on('moveend', updateBounds);
      map.on('zoomend', updateBounds);
      
      return () => {
        map.off('moveend', updateBounds);
        map.off('zoomend', updateBounds);
      };
    }, [map, onBoundsChange]);
    
    return null;
  }
  
  const handleBoundsChange = useCallback((bounds?: L.LatLngBounds) => {
    if (bounds) {
      setMapBounds(bounds);
    }
  }, []);

  // Debounced search term to reduce filtering operations
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Optimized filtering with early exits
  const filteredEvents = useMemo(() => {
    if (events.length === 0) return [];
    
    const hasSearch = debouncedSearchTerm.trim().length > 0;
    const searchLower = hasSearch ? debouncedSearchTerm.toLowerCase() : '';
    const hasCategoryFilter = selectedCategories.size > 0;
    
    return events.filter(event => {
      // Early exit for category filter
      if (hasCategoryFilter && !selectedCategories.has(event.category)) {
        return false;
      }
      
      // Early exit for year filter
      if (event.year < yearRange[0] || event.year > yearRange[1]) {
        return false;
      }
      
      // Search filter (only if search term exists)
      if (hasSearch) {
        const titleMatch = event.title.toLowerCase().includes(searchLower);
        const descMatch = event.description.toLowerCase().includes(searchLower);
        const yearMatch = event.year.toString().includes(searchLower);
        
        if (!titleMatch && !descMatch && !yearMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [events, selectedCategories, yearRange, debouncedSearchTerm]);

  // Filter events by viewport bounds for performance
  const visibleEvents = useMemo(() => {
    if (!mapBounds || filteredEvents.length === 0) {
      // Limit to 500 markers max if no bounds (initial load)
      return filteredEvents.slice(0, 500);
    }
    
    // Only show events in current viewport + small buffer
    const bounds = mapBounds;
    const buffer = 0.1; // 10% buffer
    
    const visible = filteredEvents.filter(event => {
      return (
        event.latitude >= bounds.getSouth() - buffer &&
        event.latitude <= bounds.getNorth() + buffer &&
        event.longitude >= bounds.getWest() - buffer &&
        event.longitude <= bounds.getEast() + buffer
      );
    });
    
    // Limit to 1000 markers max for performance
    return visible.slice(0, 1000);
  }, [filteredEvents, mapBounds]);

  // Memoize color function to avoid recreating on every render
  const getCategoryColor = useCallback((category: string): string => {
    const colors: Record<string, string> = {
      Science: '#3b82f6',
      Politics: '#ef4444',
      Culture: '#a855f7',
      Sports: '#22c55e',
      Technology: '#06b6d4',
      Nature: '#eab308',
      Society: '#ec4899',
      General: '#6b7280',
    };
    return colors[category] || colors.General;
  }, []);

  // Memoize size function
  const getEventSize = useCallback((event: GeocodedEvent): number => {
    // Size based on year (more recent = larger)
    const yearFactor = Math.min((event.year - 1000) / 1000, 1);
    return 4 + yearFactor * 8;
  }, []);


  if (events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={6}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
        whenReady={() => {
          setMapReady(true);
        }}
        zoomControl={true}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
        boxZoom={true}
        keyboard={true}
        attributionControl={true}
        zoomSnap={0.5}
        zoomDelta={0.5}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        
        {mapReady && (
          <>
            <MapBoundsTracker onBoundsChange={handleBoundsChange} />
            <MapUpdater 
              events={filteredEvents} 
              yearRange={yearRange} 
              onEventsLoaded={onEventsLoaded}
              onMapMove={handleBoundsChange}
            />
          </>
        )}
        
        <MarkerClusterGroup
          chunkedLoading={true}
          chunkDelay={100}
          maxClusterRadius={zoom => zoom < 3 ? 80 : 50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
          disableClusteringAtZoom={5}
        >
          {visibleEvents.map((event, index) => (
            <CircleMarker
              key={`${event.year}-${index}`}
              center={[event.latitude, event.longitude]}
              radius={getEventSize(event)}
              fillColor={getCategoryColor(event.category)}
              color="#fff"
              weight={2}
              fillOpacity={0.7}
              opacity={1}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <span 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: getCategoryColor(event.category) }}
                    />
                    <span className="text-xs font-semibold text-gray-600">{event.category}</span>
                  </div>
                  <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Year: {event.year}</p>
                  <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Read more on Wikipedia →
                    </a>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
      
      {/* Event count indicator */}
      <div className="absolute top-4 right-4 z-[1000] bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
        <div className="text-white text-sm">
          <span className="font-bold">{visibleEvents.length}</span> of <span className="font-bold">{filteredEvents.length}</span> events
        </div>
      </div>
    </div>
  );
};

export default HistoryMap;