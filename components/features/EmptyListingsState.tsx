import React from 'react';

interface EmptyListingsStateProps {
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export default function EmptyListingsState({
  searchQuery,
  selectedCategory,
  setSearchQuery,
  setSelectedCategory
}: EmptyListingsStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-16 bg-[#0c0d11]/40 border border-dashed border-gray-800 rounded-3xl text-center space-y-4 shadow-xl">
      <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner shadow-black">
        🛍️
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-300">No matching listings found</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">
          No active listings correspond to your query or selected filters. Try searching another token ID or clearing search terms.
        </p>
      </div>
      {searchQuery || selectedCategory !== 'All' ? (
        <button
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory('All');
          }}
          className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-500/20 cursor-pointer"
        >
          Reset Filters
        </button>
      ) : null}
    </div>
  );
}
