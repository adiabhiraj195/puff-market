import React from 'react';
import { FiInbox } from 'react-icons/fi';

interface CollectionsDirectoryEmptyProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function CollectionsDirectoryEmpty({
  searchQuery,
  setSearchQuery
}: CollectionsDirectoryEmptyProps) {
  return (
    <div className="max-w-md mx-auto my-12 text-center px-4 py-12 bg-zinc-950/30 border border-zinc-900/80 rounded-3xl backdrop-blur-sm">
      <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
        <FiInbox size={24} />
      </div>
      <h3 className="text-white font-bold text-lg">No Collections Found</h3>
      <p className="text-zinc-400 text-sm max-w-sm mt-1 mx-auto leading-relaxed">
        {searchQuery ? "No registered collections match your search filter criteria. Try searching a different term." : "No custom collections have been deployed on the registry yet."}
      </p>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery("")}
          className="mt-4 px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-500/20 cursor-pointer"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}
