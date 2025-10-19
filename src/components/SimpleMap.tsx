import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { GeocodedEvent } from '../services/geocodingService';
import 'leaflet/dist/leaflet.css';

interface SimpleMapProps {
  events: GeocodedEvent[];
}

const SimpleMap: React.FC<SimpleMapProps> = ({ events }) => {
  const [mapReady, setMapReady] = useState(false);

  console.log('SimpleMap render - events:', events.length);

  useEffect(() => {
    console.log('SimpleMap mounted');
    setMapReady(true);
  }, []);

  if (events.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <div className="text-gray-400">No events to display</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-[1000] bg-gray-800/90 rounded-lg p-2 text-white text-sm">
        Events: {events.length}
      </div>
      
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          maxZoom={19}
        />
        
        {events.slice(0, 10).map((event, index) => (
          <Marker
            key={`${event.year}-${index}`}
            position={[event.latitude, event.longitude]}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold">{event.title}</h3>
                <p className="text-sm text-gray-600">Year: {event.year}</p>
                <p className="text-sm">{event.description}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SimpleMap;
