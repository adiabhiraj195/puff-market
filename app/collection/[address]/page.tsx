"use client"

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletProvider";
import Loading from "@/components/ui/Loading";
import NFTCard from "@/components/ui/nft-card";
import { getCollectionDetails } from "@/api/nft";
import { NftInterface } from "@/types/nft-types";
import { 
    FiCopy, 
    FiExternalLink, 
    FiGrid, 
    FiActivity, 
    FiSearch, 
    FiUsers, 
    FiTag, 
    FiTrendingUp, 
    FiAward,
    FiInbox
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

interface CollectionHistory {
    id: string;
    tokenId: string;
    nftName: string;
    from: string;
    to: string;
    type: string;
    price: string | null;
    txHash: string;
    timestamp: string;
}

export default function CollectionPage() {
    const { address } = useParams();
    const { account } = useWallet();
    
    const [loading, setLoading] = useState<boolean>(true);
    const [collection, setCollection] = useState<CollectionDetails | null>(null);
    const [nfts, setNfts] = useState<NftInterface[]>([]);
    const [history, setHistory] = useState<CollectionHistory[]>([]);
    const [metrics, setMetrics] = useState<CollectionMetrics | null>(null);
    const [topNft, setTopNft] = useState<any | null>(null);
    
    // UI states
    const [activeTab, setActiveTab] = useState<"items" | "activity">("items");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<"all" | "listed" | "vaulted">("all");
    const [copied, setCopied] = useState<boolean>(false);

    const fetchData = async () => {
        if (!address) return;
        try {
            setLoading(true);
            const data = await getCollectionDetails(address as string);
            if (data.success) {
                setCollection(data.collection);
                setNfts(data.nfts || []);
                setHistory(data.history || []);
                setMetrics(data.metrics);
                setTopNft(data.topNft);
            }
        } catch (error) {
            console.error("Error fetching collection details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [address]);

    const handleCopyAddress = () => {
        if (!collection) return;
        navigator.clipboard.writeText(collection.contractAddress);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const isOwner = !!(
        account && 
        collection?.owner?.address && 
        account.toLowerCase() === collection.owner.address.toLowerCase()
    );

    // Filtering logic
    const filteredNfts = nfts.filter(nft => {
        const matchesSearch = 
            nft.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
            nft.tokenId.includes(searchQuery);
            
        const matchesStatus = 
            statusFilter === "all" ||
            (statusFilter === "listed" && nft.isListed) ||
            (statusFilter === "vaulted" && !nft.isListed);

        return matchesSearch && matchesStatus;
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

    if (!collection) {
        return (
            <div className="max-w-md mx-auto my-20 text-center px-4">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-500">
                    <FiInbox size={32} />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Collection Not Found</h2>
                <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
                    The requested collection does not exist or has not been registered in the database yet.
                </p>
                <Link 
                    href="/" 
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold border border-zinc-800 transition-colors"
                >
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    return (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 selection:bg-blue-600/35 selection:text-white">
            
            {/* Background ambient lights */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none z-0" />
            <div className="absolute top-64 right-1/4 w-80 h-80 bg-purple-600/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

            {/* HERO HEADER */}
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

            {/* TAB SELECTOR & FILTERS */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 z-10 relative">
                {/* Tabs */}
                <div className="flex bg-[#0c0d11]/80 border border-zinc-800/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-sm">
                    <button
                        onClick={() => setActiveTab("items")}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === "items"
                                ? "bg-zinc-850 text-white shadow-md border border-zinc-800"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <FiGrid size={13} /> Items ({filteredNfts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("activity")}
                        className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                            activeTab === "activity"
                                ? "bg-zinc-850 text-white shadow-md border border-zinc-800"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        <FiActivity size={13} /> Activity ({history.length})
                    </button>
                </div>

                {/* Filters (only visible in Items tab) */}
                {activeTab === "items" && (
                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                        {/* Search Input */}
                        <div className="relative flex-1 md:flex-initial">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                                <FiSearch size={14} />
                            </span>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by Token ID or Name..."
                                className="w-full md:w-64 pl-10 pr-4 py-2.5 text-xs bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-650 focus:outline-none focus:ring-1 focus:ring-indigo-500/55 transition-all"
                            />
                        </div>

                        {/* Status Filter Selector */}
                        <div className="flex bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-1 font-bold text-[10px]">
                            <button
                                onClick={() => setStatusFilter("all")}
                                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                                    statusFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-550 hover:text-zinc-300"
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setStatusFilter("listed")}
                                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                                    statusFilter === "listed" ? "bg-indigo-650 text-white" : "text-zinc-550 hover:text-zinc-300"
                                }`}
                            >
                                Listed
                            </button>
                            <button
                                onClick={() => setStatusFilter("vaulted")}
                                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                                    statusFilter === "vaulted" ? "bg-zinc-800 text-white" : "text-zinc-550 hover:text-zinc-300"
                                }`}
                            >
                                Vaulted
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* TAB CONTENTS */}
            <div className="relative z-10">
                {activeTab === "items" ? (
                    filteredNfts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredNfts.map((nft) => (
                                <Link 
                                    href={`/nft/${nft.id}`} 
                                    key={nft.id}
                                    className="block group"
                                >
                                    <NFTCard 
                                        tokenId={nft.tokenId}
                                        name={nft.name}
                                        imageUrl={nft.imageURI}
                                        price={nft.listing?.price}
                                        paymentToken={nft.listing?.paymentToken}
                                    />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-[#121214]/35 border border-zinc-800/80 rounded-2xl py-16 px-4 text-center">
                            <div className="w-16 h-16 bg-zinc-950 border border-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                                <FiGrid size={24} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Items Found</h3>
                            <p className="text-zinc-400 text-sm max-w-sm mt-1 mx-auto leading-relaxed">
                                No NFTs match your search queries or filter choices in this collection.
                            </p>
                        </div>
                    )
                ) : (
                    /* ACTIVITY TAB */
                    history.length > 0 ? (
                        <div className="bg-[#0c0d11]/45 border border-zinc-800/60 rounded-2xl backdrop-blur-sm shadow-xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse table-auto text-left">
                                    <thead>
                                        <tr className="border-b border-zinc-800 text-[10px] text-zinc-500 uppercase font-black tracking-widest bg-zinc-950/30">
                                            <th className="py-4 px-6">Event</th>
                                            <th className="py-4 px-4">Item</th>
                                            <th className="py-4 px-4">Price</th>
                                            <th className="py-4 px-4">From</th>
                                            <th className="py-4 px-4">To</th>
                                            <th className="py-4 px-6 text-right">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-800/50">
                                        {history.map((tx) => {
                                            let badgeStyle = "bg-zinc-800 text-zinc-400";
                                            if (tx.type === "MINT") badgeStyle = "bg-green-500/10 text-green-400 border border-green-500/20";
                                            else if (tx.type === "SALE") badgeStyle = "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
                                            else if (tx.type === "AUCTION") badgeStyle = "bg-purple-500/10 text-purple-400 border border-purple-500/20";

                                            return (
                                                <tr key={tx.id} className="hover:bg-zinc-900/15 transition-colors align-middle text-sm text-zinc-300">
                                                    <td className="py-4.5 px-6">
                                                        <span className={`inline-flex px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-widest rounded-md ${badgeStyle}`}>
                                                            {tx.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4.5 px-4 font-bold text-white">
                                                        {tx.nftName || `NFT #${tx.tokenId}`}
                                                        <span className="text-zinc-500 text-[10px] ml-1.5 font-mono">#{tx.tokenId}</span>
                                                    </td>
                                                    <td className="py-4.5 px-4 font-mono font-bold text-yellow-400">
                                                        {tx.price ? `${Number(tx.price).toLocaleString()} PUFF` : "—"}
                                                    </td>
                                                    <td className="py-4.5 px-4 font-mono text-xs">
                                                        {tx.from === "0x0000000000000000000000000000000000000000" ? "NullAddress" : formatAddress(tx.from)}
                                                    </td>
                                                    <td className="py-4.5 px-4 font-mono text-xs">
                                                        {formatAddress(tx.to)}
                                                    </td>
                                                    <td className="py-4.5 px-6 text-right text-xs text-zinc-500 flex flex-col items-end gap-1.5">
                                                        <span>{new Date(tx.timestamp).toLocaleString()}</span>
                                                        <a 
                                                            href={`https://etherscan.io/tx/${tx.txHash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[10px] text-zinc-500 hover:text-indigo-400 underline flex items-center gap-0.5"
                                                        >
                                                            Tx <FiExternalLink size={8} />
                                                        </a>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#121214]/35 border border-zinc-800/80 rounded-2xl py-16 px-4 text-center">
                            <div className="w-16 h-16 bg-zinc-950 border border-zinc-850 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
                                <FiActivity size={24} />
                            </div>
                            <h3 className="text-white font-bold text-lg">No Activity Registered</h3>
                            <p className="text-zinc-400 text-sm max-w-sm mt-1 mx-auto leading-relaxed">
                                No transfers or sales have been registered on-chain for this collection.
                            </p>
                        </div>
                    )
                )}
            </div>

        </div>
    );
}
