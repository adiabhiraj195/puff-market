"use client"

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { getAllCollections } from "@/api/nft";
import { 
    FiSearch, 
    FiFolder, 
    FiCopy, 
    FiChevronRight,
    FiGrid,
    FiCompass,
    FiInbox
} from "react-icons/fi";

interface CollectionItem {
    id: string;
    contractAddress: string;
    name: string;
    symbol: string;
    ownerAddress: string;
    createdAt: string;
    nftCount: number;
}

export default function CollectionsDirectoryPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [collections, setCollections] = useState<CollectionItem[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);
                const data = await getAllCollections();
                setCollections(data || []);
            } catch (error) {
                console.error("Error fetching collections directory:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCollections();
    }, []);

    const handleCopyAddress = (e: React.MouseEvent, address: string, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(address);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Filter collections by name, symbol, or address
    const filteredCollections = collections.filter(col => {
        const query = searchQuery.toLowerCase();
        return (
            col.name.toLowerCase().includes(query) ||
            col.symbol.toLowerCase().includes(query) ||
            col.contractAddress.toLowerCase().includes(query)
        );
    });

    const formatAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh]">
                <Loading />
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 selection:bg-blue-600/35 selection:text-white">
            {/* SEO Metadata */}
            <title>Explore Collections | Puffmarket</title>
            <meta name="description" content="Explore custom deployed NFT collections on Puffmarket. Search and browse cheap ERC-721 clones." />

            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute top-64 right-1/4 w-80 h-80 bg-purple-600/[0.02] rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="relative z-10 space-y-8">
                
                {/* Hero Header Section */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <FiCompass size={12} /> Puff Registry
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Explore NFT Collections</h1>
                    <p className="text-sm text-zinc-400 leading-relaxed">
                        Discover custom EIP-1167 cloned contract collections deployed on Puffmarket. Search by brand name, token symbol, or contract address.
                    </p>
                </div>

                {/* Search Bar Controls */}
                <div className="max-w-xl mx-auto relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-550">
                        <FiSearch size={16} />
                    </span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search collections by name, symbol, or address..."
                        className="w-full pl-11 pr-4 py-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500/60 transition-all shadow-xl"
                    />
                </div>

                {/* Collections Grid Directory */}
                {filteredCollections.length > 0 ? (
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
                                        <div className="text-zinc-550 text-xs font-mono bg-zinc-950/60 border border-zinc-900/60 rounded-xl p-2.5 flex justify-between items-center gap-2 mt-2">
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
                                            <FiGrid size={12} className="text-zinc-550" />
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
                ) : (
                    /* Empty Directory State */
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
                )}
            </div>
        </div>
    );
}
