import React from 'react';

interface ListingFiltersProps {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  categories: string[];
}

export default function ListingFilters({
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  viewMode,
  setViewMode,
  categories
}: ListingFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#0c0d11]/40 border border-gray-800/60 p-4 rounded-2xl backdrop-blur-sm">
      
      {/* Category selector */}
      <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
        {categories.slice(0, 5).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                : 'bg-transparent text-gray-400 hover:bg-gray-800/40 hover:text-white'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Action filters */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Search */}
        <div className="relative flex-1 md:flex-initial">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Token ID or Address"
            className="w-full md:w-64 pl-9 pr-4 py-2 text-xs bg-black border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Sort selector */}
        <select
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
          className="bg-black border border-gray-800 rounded-xl text-xs py-2 px-3 focus:outline-none text-gray-300 cursor-pointer"
        >
          <option value="recent">Recently Listed</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>

        {/* View toggle */}
        <div className="flex border border-gray-800 rounded-xl overflow-hidden bg-black p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'
            }`}
            title="Grid View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'
            }`}
            title="List View"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
