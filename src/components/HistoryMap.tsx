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
  onEventsLoaded 
}: { 
  events: GeocodedEvent[];
  yearRange: [number, number];
  onEventsLoaded?: (newEvents: GeocodedEvent[]) => void;
}) {
  const map = useMap();
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  useEffect(() => {
    if (events.length > 0) {
      // Fit bounds to show all events with proper padding
      const bounds = events.map(e => [e.latitude, e.longitude] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { 
          padding: [50, 50], 
          maxZoom: 5,
          animate: true
        });
      }
    }
  }, [events, map]);

  // Handle map movement for dynamic loading
  const handleMapMove = useCallback(() => {
    const bounds = map.getBounds();
    const zoom = map.getZoom();
    
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
  }, [map, yearRange, onEventsLoaded]);

  useEffect(() => {
    // Add event listeners for map movement
    map.on('moveend', handleMapMove);
    map.on('zoomend', handleMapMove);

    return () => {
      map.off('moveend', handleMapMove);
      map.off('zoomend', handleMapMove);
    };
  }, [map, handleMapMove]);
  
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

  // Filter events by category, year range, and search term
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const categoryMatch = selectedCategories.size === 0 || selectedCategories.has(event.category);
      const yearMatch = event.year >= yearRange[0] && event.year <= yearRange[1];
      
      // Search filter
      let searchMatch = true;
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        searchMatch = 
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.year.toString().includes(term);
      }
      
      return categoryMatch && yearMatch && searchMatch;
    });
  }, [events, selectedCategories, yearRange, searchTerm]);

  const getCategoryColor = (category: string): string => {
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
  };

  const getEventSize = (event: GeocodedEvent): number => {
    // Size based on year (more recent = larger)
    const yearFactor = Math.min((event.year - 1000) / 1000, 1);
    return 4 + yearFactor * 8;
  };

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
        whenReady={() => setMapReady(true)}
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
        
        {mapReady && <MapUpdater events={filteredEvents} yearRange={yearRange} onEventsLoaded={onEventsLoaded} />}
        
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {filteredEvents.map((event, index) => (
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
          <span className="font-bold">{filteredEvents.length}</span> events shown
        </div>
      </div>
    </div>
  );
};

export default HistoryMap;