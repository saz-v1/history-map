import React from 'react';

interface FilterPanelProps {
  categories: string[];
  selectedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onRandomYear: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  selectedCategories,
  onToggleCategory,
  searchTerm,
  onSearchChange,
  onRandomYear,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700/30">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
      </div>

      {/* Category Filters */}
      <div>
        <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategories.has(category)
                  ? `${getCategoryBg(category)} ${getCategoryText(category)} ring-1 ring-current`
                  : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50 hover:text-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-700/30">
        <button
          onClick={onRandomYear}
          disabled={isLoading}
          className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🎲 Random
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 rounded-lg px-3 py-2 text-xs font-medium transition-colors border border-gray-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⟳' : '↻'}
        </button>
      </div>
    </div>
  );
};

function getCategoryBg(category: string): string {
  const colors: Record<string, string> = {
    Science: 'bg-blue-500/30',
    Politics: 'bg-red-500/30',
    Culture: 'bg-purple-500/30',
    Sports: 'bg-green-500/30',
    Technology: 'bg-cyan-500/30',
    Nature: 'bg-yellow-500/30',
    Society: 'bg-pink-500/30',
    General: 'bg-gray-500/30',
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

export default FilterPanel;

