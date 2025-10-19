import React from 'react';
import type { GeocodedEvent } from '../services/geocodingService';

interface TestMapProps {
  events: GeocodedEvent[];
}

const TestMap: React.FC<TestMapProps> = ({ events }) => {
  console.log('TestMap render - events:', events.length);

  return (
    <div className="w-full h-full relative bg-gray-900">
      {/* Debug info */}
      <div className="absolute top-4 left-4 z-[1000] bg-gray-800/90 rounded-lg p-3 text-white text-sm">
        <div>Events: {events.length}</div>
        <div>Map Status: Testing</div>
      </div>

      {/* Simple grid to simulate map */}
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">🗺️</div>
          <h2 className="text-2xl font-bold mb-2">Map Test</h2>
          <p className="text-gray-400 mb-4">Events loaded: {events.length}</p>
          
          {/* Show first few events */}
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Sample Events:</h3>
            {events.slice(0, 3).map((event, index) => (
              <div key={index} className="text-sm text-gray-300 mb-1 p-2 bg-gray-800/50 rounded">
                <strong>{event.year}:</strong> {event.title}
                <br />
                <span className="text-xs text-gray-500">
                  📍 {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMap;
