import React from 'react';

interface MarketStatsProps {
  collectionsCount: number;
  floorPrice: number;
  totalVolume: number;
  listingsCount: number;
}

export default function MarketStats({
  collectionsCount,
  floorPrice,
  totalVolume,
  listingsCount
}: MarketStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0c0d11]/80 border border-gray-800/80 rounded-2xl backdrop-blur-md shadow-2xl">
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Collections</span>
        <span className="text-2xl font-black text-white">{collectionsCount}</span>
      </div>
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Floor Price</span>
        <span className="text-2xl font-black text-yellow-400">{floorPrice.toLocaleString()} PUFF</span>
      </div>
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Total Volume</span>
        <span className="text-2xl font-black text-white">{totalVolume.toLocaleString()} PUFF</span>
      </div>
      <div>
        <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Total Listings</span>
        <span className="text-2xl font-black text-blue-500">{listingsCount} Listed</span>
      </div>
    </div>
  );
}
