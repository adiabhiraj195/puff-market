import React from 'react';
import Link from 'next/link';
import { IoGridOutline } from "react-icons/io5";
import NftCard from "./NftCard";

interface AccountDashboardProps {
  activeTab: 'nfts' | 'collections';
  setActiveTab: (tab: 'nfts' | 'collections') => void;
  nfts: any[];
  collections: any[];
  onDeployClick: () => void;
}

export default function AccountDashboard({
  activeTab,
  setActiveTab,
  nfts,
  collections,
  onDeployClick
}: AccountDashboardProps) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 min-h-[450px] shadow-xl flex flex-col">
        
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('nfts')}
            className={`text-lg font-bold flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'nfts'
                ? 'border-indigo-500 text-white font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <IoGridOutline className="text-indigo-400" />
            My NFTs ({nfts.length})
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`text-lg font-bold flex items-center gap-2 pb-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'collections'
                ? 'border-indigo-500 text-white font-extrabold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <span className="text-indigo-400">📁</span>
            My Collections ({collections.length})
          </button>
        </div>
        {activeTab === 'collections' && (
          <button
            onClick={onDeployClick}
            className="text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 px-3.5 py-1.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
          >
            + Deploy Collection
          </button>
        )}
      </div>

      {activeTab === 'nfts' ? (
        nfts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {nfts.map((item: any) => (
              <Link 
                href={`/nft/${item.id}`} 
                key={item.id} 
                className="transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/5 duration-200 block"
              >
                <div className="h-full">
                  <NftCard
                    tokenId={item.tokenId}
                    imageUrl={item.imageURI}
                    name={item.metadata?.name || item.name}
                    price={item.listing?.price}
                    paymentToken={item.listing?.paymentToken}
                  />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <IoGridOutline size={26} />
            </div>
            <h4 className="text-white font-bold text-lg">No NFTs Owned Yet</h4>
            <p className="text-zinc-400 text-sm max-w-sm mt-1 mb-6 leading-relaxed">
              You haven&apos;t minted or purchased any NFTs on the platform yet. Click below to start creating!
            </p>
            <Link 
              href="/mint"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Mint Your First NFT
            </Link>
          </div>
        )
      ) : (
        collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {collections.map((col: any) => (
              <Link href={`/collection/${col.contractAddress}`} key={col.id} className="block group">
                <div className="bg-zinc-950/60 border border-zinc-800 hover:border-indigo-500/50 rounded-xl p-5 flex flex-col justify-between hover:shadow-lg hover:shadow-indigo-500/[0.02] transition-all duration-200 h-full relative">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">{col.name}</h4>
                      <span className="text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                        {col.symbol}
                      </span>
                    </div>
                    <div className="text-zinc-500 text-xs mt-1 font-mono break-all bg-zinc-900 border border-zinc-800/40 rounded-lg p-2.5 flex justify-between items-center gap-2">
                      <span className="truncate">{col.contractAddress}</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigator.clipboard.writeText(col.contractAddress);
                          alert("Contract address copied!");
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-[10px] font-bold cursor-pointer underline flex-shrink-0"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-zinc-800/60 pt-4 mt-4 flex justify-between items-center text-xs text-zinc-400">
                    <span>Owner: You 👑</span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {new Date(col.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <span className="text-2xl">📁</span>
            </div>
            <h4 className="text-white font-bold text-lg">No Custom Collections Yet</h4>
            <p className="text-zinc-400 text-sm max-w-sm mt-1 mb-6 leading-relaxed">
              Deploy cheap EIP-1167 cloned contracts to maintain your own custom NFT collections and brand yourself!
            </p>
            <button 
              onClick={onDeployClick}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
            >
              Deploy Your First Collection
            </button>
          </div>
        )
      )}
    </div>
  );
}
