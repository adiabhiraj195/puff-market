import React from 'react';
import Link from 'next/link';
import { ListingInterface } from '@/types/nft-types';
import TokenSymbol from './TokenSymbol';

interface ListingCardProps {
  item: ListingInterface;
}

export default function ListingCard({ item }: ListingCardProps) {
  return (
    <Link
      href={`/nft/${item.nftId}`}
      className="group bg-[#131419]/35 hover:bg-[#131419]/70 border border-gray-800/80 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
    >
      <div className="w-full aspect-square overflow-hidden bg-[#0c0d10] relative">
        <img
          src={item.nft.imageURI}
          alt={`Token #${item.nft.tokenId}`}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 text-[10px] font-black bg-black/75 backdrop-blur-md text-gray-300 px-2.5 py-1.5 rounded-xl border border-white/5 shadow-md">
          Token #{item.nft.tokenId}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div className="mb-3">
          {item.nft.collection ? (
            <span 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (item.nft.collection) {
                  window.location.href = `/collection/${item.nft.collection.contractAddress}`;
                }
              }} 
              className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-wider mb-0.5 block hover:underline cursor-pointer truncate max-w-[200px]"
              title={`${item.nft.collection.name} (${item.nft.collection.symbol})`}
            >
              {item.nft.collection.name} ({item.nft.collection.symbol})
            </span>
          ) : (
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">Puff Collection (PUFF)</p>
          )}
          <h3 className="text-sm font-black text-white truncate">{item.nft.name || "NFT Asset"}</h3>
          <p className="text-[10px] text-gray-500 mt-1.5 font-mono truncate">
            Seller: {item.seller.address.slice(0, 6)}...{item.seller.address.slice(-4)}
          </p>
        </div>
        <div className="flex justify-between items-center bg-[#0c0d10]/70 rounded-xl p-3 border border-gray-800/50">
          <div>
            <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider mb-0.5">Price</span>
            <span className="text-sm font-black text-yellow-400">
              {Number(item.price).toLocaleString()} <TokenSymbol address={item.paymentToken} />
            </span>
          </div>
          <span className="text-[10px] font-black text-blue-400 group-hover:text-white transition-colors">
            Buy Now →
          </span>
        </div>
      </div>
    </Link>
  );
}
