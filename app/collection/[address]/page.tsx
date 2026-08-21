"use client"

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/contexts/WalletProvider";
import Loading from "@/components/ui/Loading";
import NftCard from "@/components/features/NftCard";
import { useCollectionDetails } from "@/hooks/useCollectionQueries";
import { NftInterface } from "@/types/nft-types";
import CollectionHeader from "@/components/features/CollectionHeader";
import CollectionTabs from "@/components/features/CollectionTabs";
import CollectionActivityTable from "@/components/features/CollectionActivityTable";
import { FiInbox, FiGrid, FiActivity } from "react-icons/fi";

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
    
    const { data, isLoading: loading } = useCollectionDetails(address as string, {
        enabled: !!address,
    });

    const collection: CollectionDetails | null = data?.success ? data.collection : null;
    const nfts: NftInterface[] = data?.success ? (data.nfts || []) : [];
    const history: CollectionHistory[] = data?.success ? (data.history || []) : [];
    const metrics: CollectionMetrics | null = data?.success ? data.metrics : null;
    const topNft: any | null = data?.success ? data.topNft : null;

    // UI states
    const [activeTab, setActiveTab] = useState<"items" | "activity">("items");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<"all" | "listed" | "vaulted">("all");
    const [copied, setCopied] = useState<boolean>(false);

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

            {/* HERO HEADER & METRICS BANNER */}
            <CollectionHeader
                collection={collection}
                metrics={metrics}
                topNft={topNft}
                copied={copied}
                isOwner={isOwner}
                handleCopyAddress={handleCopyAddress}
                formatAddress={formatAddress}
            />

            {/* TAB SELECTOR & FILTERS */}
            <CollectionTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filteredNftsCount={filteredNfts.length}
                historyCount={history.length}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
            />

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
                                    <NftCard 
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
                            <div className="w-16 h-16 bg-zinc-950 border border-zinc-855 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
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
                        <CollectionActivityTable
                            history={history}
                            formatAddress={formatAddress}
                        />
                    ) : (
                        <div className="bg-[#121214]/35 border border-zinc-800/80 rounded-2xl py-16 px-4 text-center">
                            <div className="w-16 h-16 bg-zinc-950 border border-zinc-855 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
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
