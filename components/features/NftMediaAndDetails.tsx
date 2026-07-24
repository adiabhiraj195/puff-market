import React from 'react';
import Image from 'next/image';
import { FiBookOpen, FiGrid, FiInfo } from "react-icons/fi";
import { NftInterface, NftMetadataInteface } from "@/types/nft-types";

interface NftMediaAndDetailsProps {
  nft: NftInterface | null;
  metadata: NftMetadataInteface | null;
}

export default function NftMediaAndDetails({
  nft,
  metadata
}: NftMediaAndDetailsProps) {
  return (
    <div className="lg:col-span-5 w-full">
      {/* Image Card */}
      <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden p-4 shadow-xl mb-6">
        <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-neutral-800/60 bg-neutral-950 flex items-center justify-center">
          {nft?.imageURI ? (
            <Image
              src={nft.imageURI}
              alt={metadata?.name || "NFT Asset"}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain hover:scale-[1.02] transition-transform duration-300"
              priority
            />
          ) : (
            <div className="flex flex-col items-center text-neutral-600">
              <FiGrid size={48} className="stroke-[1.5] animate-pulse" />
              <span className="mt-2 text-xs font-semibold uppercase tracking-wider">No Image Asset</span>
            </div>
          )}
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden p-5 shadow-xl mb-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-3 flex items-center gap-2">
          <FiBookOpen size={14} className="text-blue-400" /> Description
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed pt-3 border-t border-neutral-800/40">
          {metadata?.description || "No description provided for this NFT."}
        </p>
      </div>

      {/* Traits Card */}
      <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden p-5 shadow-xl mb-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-4 flex items-center gap-2">
          <FiGrid size={14} className="text-blue-400" /> Traits
        </h3>
        <div className="border-t border-neutral-800/40 pt-4">
          {metadata?.traits && metadata.traits.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {metadata.traits.map((trait, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-500/10 bg-blue-500/[0.02] hover:bg-blue-500/[0.04] transition-colors"
                >
                  <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase mb-1">
                    {trait.key}
                  </span>
                  <span className="text-sm font-semibold text-white text-center">
                    {trait.value}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-neutral-500 py-2">No traits or properties listed.</p>
          )}
        </div>
      </div>

      {/* Details Card */}
      <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden p-5 shadow-xl mb-6">
        <h3 className="text-sm font-semibold tracking-wider uppercase text-neutral-400 mb-4 flex items-center gap-2">
          <FiInfo size={14} className="text-blue-400" /> Details
        </h3>
        <div className="border-t border-neutral-800/40 pt-3 divide-y divide-neutral-800/35">
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Contract Address</span>
            <span className="font-mono text-neutral-200">
              {nft?.contractAddress ? `${nft.contractAddress.slice(0, 6)}...${nft.contractAddress.slice(-4)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Token ID</span>
            <span className="font-semibold text-neutral-200">{nft?.tokenId || '0'}</span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Owner</span>
            <span className="font-mono text-neutral-200">
              {nft?.owner?.address ? `${nft.owner.address.slice(0, 6)}...${nft.owner.address.slice(-4)}` : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Token Standard</span>
            <span className="font-semibold text-neutral-200">ERC-721</span>
          </div>
          <div className="flex justify-between py-2.5 text-sm">
            <span className="text-neutral-400">Chain</span>
            <span className="font-semibold text-neutral-200">Ethereum Localhost</span>
          </div>
        </div>
      </div>
    </div>
  );
}
