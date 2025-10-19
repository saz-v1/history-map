import React, { useEffect, useRef, useState } from 'react';
import type { HistoricalEvent } from '../services/historyApi';
import Tooltip from './Tooltip';

interface TimelineProps {
  events: HistoricalEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  console.log('Timeline render - events:', events.length);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate timeline data
  const timelineData = React.useMemo(() => {
    if (events.length === 0 || dimensions.width === 0) return null;

    const margin = { top: 60, right: 50, bottom: 120, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const xScale = (year: number) => {
      return ((year - (minYear - 50)) / ((maxYear + 50) - (minYear - 50))) * width;
    };

    const timelineY = height / 2;

    // Calculate year markers
    const yearRange = maxYear - minYear;
    const tickInterval = Math.max(50, Math.pow(10, Math.floor(Math.log10(yearRange / 10))));
    const startYear = Math.floor(minYear / tickInterval) * tickInterval;
    const endYear = Math.ceil(maxYear / tickInterval) * tickInterval;
    
    const yearMarkers = [];
    for (let year = startYear; year <= endYear; year += tickInterval) {
      const x = xScale(year);
      if (x >= -50 && x <= width + 50) {
        yearMarkers.push({ year, x });
      }
    }

    // Process events
    const processedEvents = events.map((event, index) => {
      const alternateIndex = Math.floor(index / 2);
      const isTop = index % 2 === 0;
      const offsetY = isTop 
        ? timelineY - 60 - (alternateIndex * 40)
        : timelineY + 60 + (alternateIndex * 40);
      
      return {
        ...event,
        x: xScale(event.year),
        y: offsetY,
        radius: 8,
      };
    });

    return {
      margin,
      width,
      height,
      timelineY,
      yearMarkers,
      minYear,
      maxYear,
      processedEvents
    };
  }, [events, dimensions]);

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

  if (events.length === 0) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">No events to display</div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center">
        <div className="text-gray-400">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Horizontal Timeline Slider */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="font-mono">{timelineData.minYear}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              defaultValue="50"
              className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
            <span className="font-mono">{timelineData.maxYear}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            Drag timeline or use slider to navigate through history
          </div>
        </div>
      </div>

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      >
        <g transform={`translate(${timelineData.margin.left},${timelineData.margin.top})`}>
          {/* Timeline axis */}
          <line
            x1={0}
            y1={timelineData.timelineY}
            x2={timelineData.width}
            y2={timelineData.timelineY}
            stroke="rgba(59, 130, 246, 0.5)"
            strokeWidth={2}
          />

          {/* Year markers */}
          {timelineData.yearMarkers.map(({ year, x }) => (
            <g key={year}>
              <line
                x1={x}
                y1={timelineData.timelineY - 8}
                x2={x}
                y2={timelineData.timelineY + 8}
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth={1}
              />
              <text
                x={x}
                y={timelineData.timelineY + 25}
                textAnchor="middle"
                fill="rgba(148, 163, 184, 0.8)"
                fontSize="11px"
                fontWeight="bold"
                fontFamily="IBM Plex Mono, monospace"
              >
                {year}
              </text>
            </g>
          ))}

          {/* Events */}
          {timelineData.processedEvents.map((event, index) => (
            <g key={`${event.year}-${index}`}>
              {/* Connecting line */}
              <line
                x1={event.x}
                y1={timelineData.timelineY}
                x2={event.x}
                y2={event.y}
                stroke={getCategoryColor(event.category)}
                strokeWidth={1}
                opacity={0.4}
              />
              
              {/* Event node */}
              <g
                transform={`translate(${event.x},${event.y})`}
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseMove={(e) => setTooltipPos({ x: e.pageX, y: e.pageY })}
                onMouseLeave={() => setHoveredEvent(null)}
                onClick={() => event.url && window.open(event.url, '_blank')}
              >
                <circle
                  r={8}
                  fill={getCategoryColor(event.category)}
                  stroke={getCategoryColor(event.category)}
                  strokeWidth={2}
                  opacity={0.8}
                  style={{ filter: `drop-shadow(0 0 6px ${getCategoryColor(event.category)})` }}
                />
                <circle
                  r={4}
                  fill="white"
                  opacity={0.9}
                />
              </g>
            </g>
          ))}
        </g>
      </svg>
      
      <Tooltip
        event={hoveredEvent}
        position={tooltipPos}
        visible={hoveredEvent !== null}
      />
    </div>
  );
};

export default Timeline;