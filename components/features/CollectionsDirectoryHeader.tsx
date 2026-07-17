import React from 'react';
import { FiCompass } from 'react-icons/fi';

export default function CollectionsDirectoryHeader() {
  return (
    <div className="text-center max-w-2xl mx-auto space-y-3">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
        <FiCompass size={12} /> Puff Registry
      </div>
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Explore NFT Collections</h1>
      <p className="text-sm text-zinc-400 leading-relaxed">
        Discover custom EIP-1167 cloned contract collections deployed on Puffmarket. Search by brand name, token symbol, or contract address.
      </p>
    </div>
  );
}
