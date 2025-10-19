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
    <div className="fixed top-4 left-4 right-4 z-40 flex flex-col md:flex-row gap-4">
      {/* Search Bar */}
      <div className="glass-effect rounded-lg p-3 flex-1 border border-blue-500/20">
        <input
          type="text"
          placeholder="Search events by title, year, or description..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent text-white placeholder-gray-400 outline-none text-sm"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={onRandomYear}
          disabled={isLoading}
          className="glass-effect rounded-lg px-4 py-3 text-sm font-medium text-white hover:bg-blue-500/20 transition-colors border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          🎲 Random Year
        </button>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="glass-effect rounded-lg px-4 py-3 text-sm font-medium text-white hover:bg-blue-500/20 transition-colors border border-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '⟳' : '↻'}
        </button>
      </div>

      {/* Category Filters */}
      <div className="glass-effect rounded-lg p-3 border border-blue-500/20">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onToggleCategory(category)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategories.has(category)
                  ? `${getCategoryBg(category)} ${getCategoryText(category)} ring-2 ring-current`
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
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

