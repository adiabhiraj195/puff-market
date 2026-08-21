"use client"

import React, { useState } from "react";
import Loading from "@/components/ui/Loading";
import { useAllCollections } from "@/hooks/useCollectionQueries";
import { FiSearch } from "react-icons/fi";
import CollectionsDirectoryHeader from "@/components/features/CollectionsDirectoryHeader";
import CollectionsDirectoryGrid from "@/components/features/CollectionsDirectoryGrid";
import CollectionsDirectoryEmpty from "@/components/features/CollectionsDirectoryEmpty";

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
    const { data: collections = [], isLoading: loading } = useAllCollections();
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [copiedId, setCopiedId] = useState<string | null>(null);

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
                <CollectionsDirectoryHeader />

                {/* Search Bar Controls */}
                <div className="max-w-xl mx-auto relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500">
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
                    <CollectionsDirectoryGrid
                        filteredCollections={filteredCollections}
                        copiedId={copiedId}
                        handleCopyAddress={handleCopyAddress}
                        formatAddress={formatAddress}
                    />
                ) : (
                    /* Empty Directory State */
                    <CollectionsDirectoryEmpty
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                    />
                )}
            </div>
        </div>
    );
}
