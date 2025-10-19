import React from 'react';
import type { HistoricalEvent } from '../services/historyApi';

interface TooltipProps {
  event: HistoricalEvent | null;
  position: { x: number; y: number };
  visible: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ event, position, visible }) => {
  if (!visible || !event) return null;

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <div className="glass-effect rounded-lg shadow-2xl p-4 max-w-md border border-blue-500/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div
              className={`w-3 h-3 rounded-full ${getCategoryColor(event.category)}`}
              style={{ boxShadow: `0 0 10px ${getCategoryHex(event.category)}` }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-blue-400 font-mono text-sm font-bold mb-1">
              {event.year}
            </div>
            <h3 className="text-white font-semibold text-base mb-2 leading-tight">
              {event.title}
            </h3>
            <p className="text-gray-300 text-sm mb-2 leading-snug">
              {event.description.length > 150
                ? `${event.description.substring(0, 150)}...`
                : event.description}
            </p>
            <div className="flex items-center justify-between">
              <span className={`text-xs px-2 py-1 rounded-full ${getCategoryBg(event.category)} ${getCategoryText(event.category)}`}>
                {event.category}
              </span>
              {event.url && (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs underline pointer-events-auto"
                >
                  Read more →
                </a>
              )}
            </div>
          </div>
        </div>
        {/* Tooltip arrow */}
        <div
          className="absolute left-1/2 bottom-0 w-3 h-3 bg-slate-700/80 border-r border-b border-blue-500/30"
          style={{
            transform: 'translate(-50%, 50%) rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
};

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Science: 'bg-blue-500',
    Politics: 'bg-red-500',
    Culture: 'bg-purple-500',
    Sports: 'bg-green-500',
    Technology: 'bg-cyan-500',
    Nature: 'bg-yellow-500',
    Society: 'bg-pink-500',
    General: 'bg-gray-500',
  };
  return colors[category] || colors.General;
}

function getCategoryHex(category: string): string {
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

function getCategoryBg(category: string): string {
  const colors: Record<string, string> = {
    Science: 'bg-blue-500/20',
    Politics: 'bg-red-500/20',
    Culture: 'bg-purple-500/20',
    Sports: 'bg-green-500/20',
    Technology: 'bg-cyan-500/20',
    Nature: 'bg-yellow-500/20',
    Society: 'bg-pink-500/20',
    General: 'bg-gray-500/20',
  };
  return colors[category] || colors.General;
}

function getCategoryText(category: string): string {
  const colors: Record<string, string> = {
    Science: 'text-blue-400',
    Politics: 'text-red-400',
    Culture: 'text-purple-400',
    Sports: 'text-green-400',
    Technology: 'text-cyan-400',
    Nature: 'text-yellow-400',
    Society: 'text-pink-400',
    General: 'text-gray-400',
  };
  return colors[category] || colors.General;
}

export default Tooltip;

