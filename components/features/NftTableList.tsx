import React from 'react';
import Link from 'next/link';
import { ListingInterface } from '@/types/nft-types';
import TokenSymbol from './TokenSymbol';

interface NftTableListProps {
  filteredListings: ListingInterface[];
}

export default function NftTableList({ filteredListings }: NftTableListProps) {
  return (
    <div className="overflow-x-auto bg-[#0c0d11]/40 border border-gray-800/60 rounded-2xl backdrop-blur-sm shadow-xl">
      <table className="w-full border-collapse table-auto text-left">
        <thead>
          <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase font-black tracking-wider">
            <th className="py-4 px-6 w-16">Rank</th>
            <th className="py-4 px-4">NFT Details</th>
            <th className="py-4 px-4 w-44">Price</th>
            <th className="py-4 px-4 w-44">Seller</th>
            <th className="py-4 px-6 text-right w-28">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredListings.map((item, index) => (
            <tr
              key={item.id}
              className="border-b border-gray-800/60 hover:bg-[#131419]/30 transition-all duration-150 align-middle"
            >
              <td className="py-4 px-6 text-sm font-bold text-gray-500">{index + 1}</td>
              <td className="py-4 px-4 flex items-center gap-3">
                <img
                  src={item.nft.imageURI}
                  alt={`Token #${item.nft.tokenId}`}
                  className="w-12 h-12 rounded-xl object-cover bg-[#0d0e12] border border-gray-800/80 shadow-md"
                />
                <div>
                  <span className="font-bold text-white block text-sm">
                    {item.nft.name || `Token #${item.nft.tokenId}`}
                  </span>
                  {item.nft.collection ? (
                    <Link 
                      href={`/collection/${item.nft.collection.contractAddress}`}
                      className="text-[9px] text-blue-500 hover:text-blue-400 uppercase font-black tracking-wider block hover:underline truncate max-w-[150px]"
                      title={`${item.nft.collection.name} (${item.nft.collection.symbol})`}
                    >
                      {item.nft.collection.name} ({item.nft.collection.symbol})
                    </Link>
                  ) : (
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block">
                      Puff Collection (PUFF)
                    </span>
                  )}
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="inline-flex items-center gap-1 text-sm font-black text-yellow-400">
                  {Number(item.price).toLocaleString()} <TokenSymbol address={item.paymentToken} />
                </span>
              </td>
              <td className="py-4 px-4 text-xs font-mono text-gray-400">
                {item.seller.address.slice(0, 8)}...{item.seller.address.slice(-6)}
              </td>
              <td className="py-4 px-6 text-right">
                <Link
                  href={`/nft/${item.nftId}`}
                  className="inline-flex justify-center items-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/10 whitespace-nowrap active:scale-95"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
