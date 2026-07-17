import React from 'react';
import { 
  FiCopy, 
  FiExternalLink, 
  FiGrid, 
  FiUsers, 
  FiTag, 
  FiTrendingUp, 
  FiAward 
} from "react-icons/fi";

interface CollectionDetails {
  id: string;
  contractAddress: string;
  name: string;
  symbol: string;
  createdAt: string;
  owner: {
    id: string;
    address: string;
    username: string | null;
  };
}

interface CollectionMetrics {
  nftCount: number;
  holderCount: number;
  floorPrice: string;
  totalListedValue: string;
  totalVolume: string;
}

interface CollectionHeaderProps {
  collection: CollectionDetails;
  metrics: CollectionMetrics | null;
  topNft: any | null;
  copied: boolean;
  isOwner: boolean;
  handleCopyAddress: () => void;
  formatAddress: (addr: string) => string;
}

export default function CollectionHeader({
  collection,
  metrics,
  topNft,
  copied,
  isOwner,
  handleCopyAddress,
  formatAddress
}: CollectionHeaderProps) {
  return (
    <div className="relative z-10 bg-gradient-to-b from-[#131419]/70 to-[#0c0d11]/80 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Collection Metadata */}
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-lg border border-white/10 flex-shrink-0">
            {collection.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{collection.name}</h1>
              <span className="text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
                {collection.symbol}
              </span>
              {isOwner && (
                <span className="text-[10px] font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                  Owner 👑
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-zinc-400">
              <div className="flex items-center gap-1.5 font-mono bg-zinc-950/60 px-3 py-1.5 rounded-lg border border-zinc-800/60">
                <span>{formatAddress(collection.contractAddress)}</span>
                <button 
                  onClick={handleCopyAddress}
                  className="text-zinc-500 hover:text-white transition-colors cursor-pointer ml-1"
                  title="Copy Contract Address"
                >
                  <FiCopy size={12} className={copied ? "text-green-400" : ""} />
                </button>
              </div>
              <a 
                href={`https://etherscan.io/address/${collection.contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-white transition-colors underline"
              >
                Etherscan <FiExternalLink size={11} />
              </a>
              <span className="text-zinc-600">|</span>
              <span>Created: {new Date(collection.createdAt).toLocaleDateString()}</span>
              <span className="text-zinc-600">|</span>
              <span>
                Created By: <span className="text-zinc-300 font-semibold">{collection.owner.username || formatAddress(collection.owner.address)}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Info Box (Top NFT Showcase or Floor) */}
        {topNft && (
          <div className="bg-zinc-950/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-4 lg:max-w-xs w-full">
            <div className="w-16 h-16 rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden relative flex-shrink-0">
              <img 
                src={topNft.imageURI} 
                alt={topNft.name} 
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1 mb-1">
                <FiAward size={10} /> Top Performance
              </span>
              <h4 className="text-sm font-bold text-white truncate">{topNft.name}</h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                {topNft.topPriceType === "sale" ? "Last Sold" : "Listed"}: <span className="text-white font-bold">{Number(topNft.topPrice).toLocaleString()} PUFF</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* METRICS BANNER */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-zinc-800/60">
        <div className="bg-zinc-950/45 p-4 rounded-xl border border-zinc-800/40">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1 flex items-center gap-1.5">
            <FiGrid size={11} className="text-blue-400" /> Items
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{metrics?.nftCount || 0}</span>
        </div>
        
        <div className="bg-zinc-950/45 p-4 rounded-xl border border-zinc-800/40">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1 flex items-center gap-1.5">
            <FiUsers size={11} className="text-indigo-400" /> Unique Holders
          </span>
          <span className="text-xl sm:text-2xl font-black text-white">{metrics?.holderCount || 0}</span>
        </div>
        
        <div className="bg-zinc-950/45 p-4 rounded-xl border border-zinc-800/40">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1 flex items-center gap-1.5">
            <FiTag size={11} className="text-yellow-400" /> Floor Price
          </span>
          <span className="text-xl sm:text-2xl font-black text-yellow-400 font-mono">
            {Number(metrics?.floorPrice || 0) > 0 ? `${Number(metrics?.floorPrice).toLocaleString()} PUFF` : "—"}
          </span>
        </div>

        <div className="bg-zinc-950/45 p-4 rounded-xl border border-zinc-800/40">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-bold mb-1 flex items-center gap-1.5">
            <FiTrendingUp size={11} className="text-green-400" /> Total Volume
          </span>
          <span className="text-xl sm:text-2xl font-black text-white font-mono">
            {Number(metrics?.totalVolume || 0) > 0 ? `${Number(metrics?.totalVolume).toLocaleString()} PUFF` : "0 PUFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
