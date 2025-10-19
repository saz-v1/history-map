import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import gsap from 'gsap';
import type { HistoricalEvent } from '../services/historyApi';
import Tooltip from './Tooltip';

interface TimelineProps {
  events: HistoricalEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<HistoricalEvent | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || events.length === 0 || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 100, right: 50, bottom: 100, left: 50 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Create scales
    const years = events.map(e => e.year);
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    const xScale = d3.scaleLinear()
      .domain([minYear - 50, maxYear + 50])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // Create main group with zoom behavior
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Define zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .translateExtent([[-width, -height], [width * 2, height * 2]])
      .on('zoom', (event) => {
        g.attr('transform', `translate(${margin.left + event.transform.x},${margin.top + event.transform.y}) scale(${event.transform.k})`);
      });

    svg.call(zoom as any);

    // Draw era bands
    const eras = [
      { start: minYear, end: 1000, label: 'Ancient', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 1000, end: 1500, label: 'Medieval', color: 'rgba(55, 65, 81, 0.1)' },
      { start: 1500, end: 1800, label: 'Early Modern', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 1800, end: 1900, label: 'Industrial', color: 'rgba(55, 65, 81, 0.1)' },
      { start: 1900, end: 2000, label: '20th Century', color: 'rgba(30, 58, 138, 0.1)' },
      { start: 2000, end: maxYear + 50, label: '21st Century', color: 'rgba(55, 65, 81, 0.1)' },
    ];

    eras.forEach((era, i) => {
      if (era.end >= minYear && era.start <= maxYear) {
        g.append('rect')
          .attr('x', xScale(Math.max(era.start, minYear - 50)))
          .attr('y', 0)
          .attr('width', xScale(Math.min(era.end, maxYear + 50)) - xScale(Math.max(era.start, minYear - 50)))
          .attr('height', height)
          .attr('fill', era.color)
          .attr('opacity', 0.3);

        // Era label
        g.append('text')
          .attr('x', xScale((Math.max(era.start, minYear) + Math.min(era.end, maxYear)) / 2))
          .attr('y', 30)
          .attr('text-anchor', 'middle')
          .attr('fill', 'rgba(148, 163, 184, 0.5)')
          .attr('font-size', '14px')
          .attr('font-weight', 'bold')
          .text(era.label);
      }
    });

    // Draw timeline axis
    const timelineY = height / 2;
    g.append('line')
      .attr('x1', 0)
      .attr('y1', timelineY)
      .attr('x2', width)
      .attr('y2', timelineY)
      .attr('stroke', 'rgba(59, 130, 246, 0.5)')
      .attr('stroke-width', 2);

    // Draw year markers
    const yearTicks = xScale.ticks(20);
    yearTicks.forEach(year => {
      g.append('line')
        .attr('x1', xScale(year))
        .attr('y1', timelineY - 10)
        .attr('x2', xScale(year))
        .attr('y2', timelineY + 10)
        .attr('stroke', 'rgba(148, 163, 184, 0.3)')
        .attr('stroke-width', 1);

      g.append('text')
        .attr('x', xScale(year))
        .attr('y', timelineY + 30)
        .attr('text-anchor', 'middle')
        .attr('fill', 'rgba(148, 163, 184, 0.7)')
        .attr('font-size', '12px')
        .attr('font-family', 'IBM Plex Mono, monospace')
        .text(year);
    });

    // Group events by year to handle overlaps
    const eventsByYear = d3.group(events, e => e.year);
    const processedEvents: Array<HistoricalEvent & { offsetY: number }> = [];

    eventsByYear.forEach((yearEvents, year) => {
      yearEvents.forEach((event, index) => {
        const alternateIndex = Math.floor(index / 2);
        const isTop = index % 2 === 0;
        const offsetY = isTop 
          ? timelineY - 60 - (alternateIndex * 40)
          : timelineY + 60 + (alternateIndex * 40);
        
        processedEvents.push({ ...event, offsetY });
      });
    });

    // Draw connecting lines
    processedEvents.forEach(event => {
      g.append('line')
        .attr('x1', xScale(event.year))
        .attr('y1', timelineY)
        .attr('x2', xScale(event.year))
        .attr('y2', event.offsetY)
        .attr('stroke', getCategoryColor(event.category))
        .attr('stroke-width', 1)
        .attr('opacity', 0.4);
    });

    // Draw event nodes
    const nodes = g.selectAll('.event-node')
      .data(processedEvents)
      .enter()
      .append('g')
      .attr('class', 'event-node')
      .attr('transform', d => `translate(${xScale(d.year)},${d.offsetY})`)
      .style('cursor', 'pointer');

    // Add glow circles
    nodes.append('circle')
      .attr('r', 8)
      .attr('fill', d => getCategoryColor(d.category))
      .attr('stroke', d => getCategoryColor(d.category))
      .attr('stroke-width', 2)
      .attr('opacity', 0.8)
      .style('filter', d => `drop-shadow(0 0 6px ${getCategoryColor(d.category)})`);

    // Add inner circle
    nodes.append('circle')
      .attr('r', 4)
      .attr('fill', 'white')
      .attr('opacity', 0.9);

    // Add hover effects
    nodes.on('mouseenter', function(event, d) {
      const node = d3.select(this);
      
      // Animate scale
      gsap.to(node.select('circle').node(), {
        attr: { r: 12 },
        duration: 0.3,
        ease: 'power2.out'
      });

      // Show tooltip
      setHoveredEvent(d);
      setTooltipPos({ x: event.pageX, y: event.pageY });
    })
    .on('mousemove', function(event) {
      setTooltipPos({ x: event.pageX, y: event.pageY });
    })
    .on('mouseleave', function() {
      const node = d3.select(this);
      
      gsap.to(node.select('circle').node(), {
        attr: { r: 8 },
        duration: 0.3,
        ease: 'power2.out'
      });

      setHoveredEvent(null);
    })
    .on('click', function(event, d) {
      if (d.url) {
        window.open(d.url, '_blank');
      }
    });

    // Add entrance animation
    nodes.style('opacity', 0)
      .transition()
      .duration(800)
      .delay((d, i) => i * 2)
      .style('opacity', 1);

  }, [events, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ cursor: 'grab' }}
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

