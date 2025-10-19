import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { HistoricalEvent } from '../services/historyApi';
import Tooltip from './Tooltip';

interface TimelineProps {
  events: HistoricalEvent[];
}

interface ProcessedEvent extends HistoricalEvent {
  offsetY: number;
  x: number;
  y: number;
  radius: number;
  isHovered?: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [processedEvents, setProcessedEvents] = useState<ProcessedEvent[]>([]);
  const [transform, setTransform] = useState({ x: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [timelineRange, setTimelineRange] = useState({ min: 0, max: 100 });
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height,
        });
        setCanvasSize({
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (events.length === 0 || dimensions.width === 0) return;

    const margin = { top: 100, right: 50, bottom: 100, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create scales
    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const xScale = (year: number) => {
      return ((year - (minYear - 50)) / ((maxYear + 50) - (minYear - 50))) * width;
    };

    const timelineY = height / 2;

    // Group events by year to handle overlaps
    const eventsByYear = new Map<number, HistoricalEvent[]>();
    events.forEach(event => {
      if (!eventsByYear.has(event.year)) {
        eventsByYear.set(event.year, []);
      }
      eventsByYear.get(event.year)!.push(event);
    });

    const processed: ProcessedEvent[] = [];

    eventsByYear.forEach((yearEvents, year) => {
      yearEvents.forEach((event, index) => {
        const alternateIndex = Math.floor(index / 2);
        const isTop = index % 2 === 0;
        const offsetY = isTop 
          ? timelineY - 60 - (alternateIndex * 40)
          : timelineY + 60 + (alternateIndex * 40);
        
        processed.push({
          ...event,
          offsetY,
          x: xScale(event.year),
          y: offsetY,
          radius: 8,
        });
      });
    });

    setProcessedEvents(processed);
    
    // Calculate timeline range for slider
    const timelineMin = minYear - 50;
    const timelineMax = maxYear + 50;
    setTimelineRange({ min: timelineMin, max: timelineMax });
  }, [events, dimensions]);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || processedEvents.length === 0 || canvasSize.width === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use requestAnimationFrame for smooth rendering
    requestAnimationFrame(() => {
      // Set canvas size to match container
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;

      const margin = { top: 60, right: 50, bottom: 120, left: 50 };
      const width = canvasSize.width - margin.left - margin.right;
      const height = canvasSize.height - margin.top - margin.bottom;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Set up transform - only horizontal movement, vertical is fixed
      ctx.save();
      ctx.translate(margin.left + transform.x, margin.top);
      ctx.scale(transform.scale, 1); // Only scale X, keep Y fixed

    // Draw era bands
    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const eras = [
      { start: minYear, end: 1000, label: 'Ancient', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 1000, end: 1500, label: 'Medieval', color: 'rgba(55, 65, 81, 0.1)' },
      { start: 1500, end: 1800, label: 'Early Modern', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 1800, end: 1900, label: 'Industrial', color: 'rgba(55, 65, 81, 0.1)' },
      { start: 1900, end: 2000, label: '20th Century', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 2000, end: maxYear + 50, label: '21st Century', color: 'rgba(55, 65, 81, 0.1)' },
    ];

    const xScale = (year: number) => {
      return ((year - (minYear - 50)) / ((maxYear + 50) - (minYear - 50))) * width;
    };

    eras.forEach((era) => {
      if (era.end >= minYear && era.start <= maxYear) {
        const x = xScale(Math.max(era.start, minYear - 50));
        const w = xScale(Math.min(era.end, maxYear + 50)) - x;
        
        ctx.fillStyle = era.color;
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, 0, w, height);
        ctx.globalAlpha = 1;

        // Era label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
        ctx.font = 'bold 14px Inter, system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(era.label, x + w / 2, 30);
      }
    });

    // Draw timeline axis
    const timelineY = height / 2;
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, timelineY);
    ctx.lineTo(width, timelineY);
    ctx.stroke();

    // Draw year markers with better spacing
    const yearRange = maxYear - minYear;
    const tickInterval = Math.max(50, Math.pow(10, Math.floor(Math.log10(yearRange / 10))));
    const startYear = Math.floor(minYear / tickInterval) * tickInterval;
    const endYear = Math.ceil(maxYear / tickInterval) * tickInterval;
    
    for (let year = startYear; year <= endYear; year += tickInterval) {
      const x = xScale(year);
      
      // Only draw if within visible range
      if (x >= -50 && x <= width + 50) {
        // Tick mark
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, timelineY - 8);
        ctx.lineTo(x, timelineY + 8);
        ctx.stroke();

        // Year label
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.font = 'bold 11px IBM Plex Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(year.toString(), x, timelineY + 25);
      }
    }

    // Draw connecting lines
    processedEvents.forEach(event => {
      ctx.strokeStyle = getCategoryColor(event.category);
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.moveTo(event.x, timelineY);
      ctx.lineTo(event.x, event.y);
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Draw event nodes
    processedEvents.forEach(event => {
      const radius = event.isHovered ? 12 : event.radius;
      
      // Outer glow
      ctx.shadowColor = getCategoryColor(event.category);
      ctx.shadowBlur = event.isHovered ? 20 : 6;
      ctx.fillStyle = getCategoryColor(event.category);
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius, 0, 2 * Math.PI);
      ctx.fill();

      // Inner circle
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'white';
      ctx.globalAlpha = 0.9;
      ctx.beginPath();
      ctx.arc(event.x, event.y, radius * 0.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    ctx.restore();
    });
  }, [processedEvents, canvasSize, transform, events]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const findEventAt = useCallback((x: number, y: number): ProcessedEvent | null => {
    const margin = { top: 60, right: 50, bottom: 120, left: 50 };
    const adjustedX = (x - margin.left - transform.x) / transform.scale;
    const adjustedY = y - margin.top; // No Y scaling - keep vertical position fixed

    // Check events in reverse order (top-most first)
    for (let i = processedEvents.length - 1; i >= 0; i--) {
      const event = processedEvents[i];
      const distance = Math.sqrt(
        Math.pow(adjustedX - event.x, 2) + Math.pow(adjustedY - event.y, 2)
      );
      
      if (distance <= event.radius) {
        return event;
      }
    }
    return null;
  }, [processedEvents, transform]);


  const handleMouseLeave = useCallback(() => {
    setHoveredEvent(null);
    setProcessedEvents(prev => 
      prev.map(e => ({ ...e, isHovered: false }))
    );
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const event = findEventAt(x, y);
    if (event && event.url) {
      window.open(event.url, '_blank');
    }
  }, [findEventAt]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: 0 });
  }, [transform.x]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(5, transform.scale * delta));
    
    // Calculate the center of the canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    
    // Calculate the center point of the timeline horizontally
    const margin = { left: 50 };
    
    // Convert timeline center to world coordinates (only X matters)
    const worldCenterX = (centerX - margin.left - transform.x) / transform.scale;
    
    // Calculate new X transform to keep the timeline horizontally centered
    const newX = centerX - margin.left - worldCenterX * newScale;
    
    setTransform({
      x: newX,
      scale: newScale
    });
  }, [transform.scale, transform.x]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Handle dragging - only horizontal
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const margin = { left: 50 };
      const maxX = margin.left;
      const minX = margin.left - (canvasSize.width - 100) * 3; // Allow more drag range
      
      setTransform(prev => ({
        x: Math.max(minX, Math.min(maxX, newX)),
        scale: prev.scale
      }));
      return;
    }

    // Handle hover detection
    const event = findEventAt(x, y);
    
    if (event !== hoveredEvent) {
      // Update hover state
      setProcessedEvents(prev => 
        prev.map(e => ({ ...e, isHovered: e === event }))
      );
      setHoveredEvent(event);
    }

    if (event) {
      setTooltipPos({ x: e.pageX, y: e.pageY });
    }
  }, [findEventAt, hoveredEvent, isDragging, dragStart, canvasSize.width]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    
    // Calculate timeline range based on actual data
    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;
    
    // Convert slider value (0-100) to year
    const targetYear = minYear + (value / 100) * yearRange;
    
    // Calculate timeline width and position
    const margin = { left: 50 };
    const timelineWidth = canvasSize.width - margin.left - 50;
    const timelineCenterX = canvasSize.width / 2;
    
    // Calculate where this year should be positioned
    const yearPosition = ((targetYear - minYear) / yearRange) * timelineWidth;
    const newX = timelineCenterX - margin.left - yearPosition * transform.scale;
    
    setTransform(prev => ({
      x: newX,
      scale: prev.scale
    }));
  }, [events, canvasSize.width, transform.scale]);

  const getCurrentSliderValue = useCallback(() => {
    if (events.length === 0) return 50;
    
    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    const yearRange = maxYear - minYear;
    
    const margin = { left: 50 };
    const timelineWidth = canvasSize.width - margin.left - 50;
    const timelineCenterX = canvasSize.width / 2;
    
    // Calculate current year based on timeline position
    const currentPosition = (timelineCenterX - margin.left - transform.x) / transform.scale;
    const currentYear = minYear + (currentPosition / timelineWidth) * yearRange;
    
    return Math.max(0, Math.min(100, ((currentYear - minYear) / yearRange) * 100));
  }, [events, canvasSize.width, transform.x, transform.scale]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {/* Horizontal Timeline Slider */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <span className="font-mono">{timelineRange.min}</span>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={getCurrentSliderValue()}
              onChange={handleSliderChange}
              className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${getCurrentSliderValue()}%, #374151 ${getCurrentSliderValue()}%, #374151 100%)`
              }}
            />
            <span className="font-mono">{timelineRange.max}</span>
          </div>
          <div className="text-xs text-gray-400 mt-1 text-center">
            Drag timeline or use slider to navigate through history
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        className="w-full h-full"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onWheel={handleWheel}
        style={{ 
          cursor: isDragging ? 'grabbing' : (hoveredEvent ? 'pointer' : 'grab')
        }}
      />
      <Tooltip
        event={hoveredEvent}
        position={tooltipPos}
        visible={hoveredEvent !== null}
      />
    </div>
  );
};

function getCategoryColor(category: string): string {
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
}

export default Timeline;

