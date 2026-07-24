import React from 'react';
import Link from 'next/link';
import { FiGrid, FiChevronRight } from 'react-icons/fi';

interface CollectionItem {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  ownerAddress: string;
  createdAt: string;
  nftCount: number;
}

interface CollectionsDirectoryGridProps {
  filteredCollections: CollectionItem[];
  copiedId: string | null;
  handleCopyAddress: (e: React.MouseEvent, address: string, id: string) => void;
  formatAddress: (addr: string) => string;
}

export default function CollectionsDirectoryGrid({
  filteredCollections,
  copiedId,
  handleCopyAddress,
  formatAddress
}: CollectionsDirectoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
      {filteredCollections.map((col) => (
        <Link 
          href={`/collection/${col.contractAddress}`} 
          key={col.id}
          className="block group"
        >
          <div className="bg-[#131419]/35 hover:bg-[#131419]/70 border border-zinc-800/80 hover:border-blue-500/50 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/[0.02] flex flex-col justify-between h-full min-h-[200px] relative">
            
            {/* Card Header */}
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-base font-black shadow border border-white/5 flex-shrink-0 group-hover:scale-105 transition-transform">
                    {col.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-base group-hover:text-blue-400 transition-colors tracking-tight line-clamp-1">
                      {col.name}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded mt-0.5 inline-block">
                      {col.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contract Address Display */}
              <div className="text-zinc-400 text-xs font-mono bg-zinc-950/60 border border-zinc-900/60 rounded-xl p-2.5 flex justify-between items-center gap-2 mt-2">
                <span className="truncate">{formatAddress(col.contractAddress)}</span>
                <button 
                  onClick={(e) => handleCopyAddress(e, col.contractAddress, col.id)}
                  className="text-blue-400 hover:text-blue-300 text-[10px] font-bold cursor-pointer underline flex-shrink-0"
                >
                  {copiedId === col.id ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            {/* Card Footer Details */}
            <div className="border-t border-zinc-900/80 pt-4 mt-5 flex justify-between items-center text-xs text-zinc-400">
              <div className="flex items-center gap-1.5">
                <FiGrid size={12} className="text-zinc-500" />
                <span>
                  <strong className="text-zinc-200">{col.nftCount}</strong> {col.nftCount === 1 ? "item" : "items"}
                </span>
              </div>
              <span className="text-[10px] font-bold text-blue-400 group-hover:text-white transition-colors flex items-center gap-0.5">
                View Registry <FiChevronRight size={12} className="translate-y-0.5" />
              </span>
            </div>
            
          </div>
        </Link>
      ))}
    </div>
  );
}
