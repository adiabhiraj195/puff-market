"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import { NftInterface, NftMetadataInteface } from "@/types/nft-types";
import { TransactionInterface } from "@/types/transaction-types";
import Image from "next/image";
import ListingHeader from "@/components/listing-header";
import SaleCard from "@/components/sale-card";
import PriceHistory from "@/components/ui/price-history";
import TransactionHistory from "@/components/transaction-history";
import { getNftById, getNftTransactions } from "@/api/nft";
import { useWallet } from "@/contexts/WalletProvider";
import ListModal from "@/components/ListModal";
import BuyModal from "@/components/BuyModal";
import { FiBookOpen, FiGrid, FiInfo } from "react-icons/fi";

export default function NftPage() {
    const { id } = useParams();

    const { account } = useWallet();
    const [loading, setLoading] = useState<boolean>(false);
    const [nft, setNft] = useState<NftInterface | null>(null);
    const [metadata, setMetadata] = useState<NftMetadataInteface | null>(null);
    const [transactions, setTransactions] = useState<TransactionInterface[]>([]);
    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    const refetchNftData = async () => {
        try {
            setLoading(true);
            const result = await getNftById(id as string);
            if (result.success) {
                setNft(result.nft);
                if (result.nft) {
                    const dbMetadata: NftMetadataInteface = {
                        name: result.nft.name || "",
                        description: result.nft.description || "",
                        creator: { name: result.nft.creatorAddress || result.nft.owner?.userName || "Anonymous" },
                        traits: Array.isArray(result.nft.attributes)
                            ? result.nft.attributes.map((a: any) => ({
                                  key: a.key || a.trait_type || "",
                                  value: a.value || ""
                              }))
                            : []
                    };
                    setMetadata(dbMetadata);
                }
            }
            const txResult = await getNftTransactions(id as string);
            if (txResult.success) {
                setTransactions(txResult.transactions);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getNftById(id as string);
                if (result.success) {
                    setNft(result.nft);

                    // Initialize metadata with database fields
                    if (result.nft) {
                        const dbMetadata: NftMetadataInteface = {
                            name: result.nft.name || "",
                            description: result.nft.description || "",
                            creator: { name: result.nft.creatorAddress || result.nft.owner?.userName || "Anonymous" },
                            traits: Array.isArray(result.nft.attributes)
                                ? result.nft.attributes.map((a: any) => ({
                                      key: a.key || a.trait_type || "",
                                      value: a.value || ""
                                  }))
                                : []
                        };
                        setMetadata(dbMetadata);
                    }

                    // Attempt resolving IPFS URI using Pinata gateway fallback
                    try {
                        let ipfsUrl = result.nft.metadataURI;
                        if (ipfsUrl && ipfsUrl.startsWith("ipfs://")) {
                            ipfsUrl = `https://sapphire-keen-aardvark-438.mypinata.cloud/ipfs/${ipfsUrl.replace("ipfs://", "")}`;
                        }
                        if (ipfsUrl) {
                            const metadataRes = await fetch(ipfsUrl);
                            if (metadataRes.ok) {
                                const ipfsJson = await metadataRes.json();
                                setMetadata({
                                    name: ipfsJson.name || result.nft.name || "",
                                    description: ipfsJson.description || result.nft.description || "",
                                    creator: { name: ipfsJson.creator?.name || ipfsJson.author || result.nft.creatorAddress || "Anonymous" },
                                    traits: Array.isArray(ipfsJson.traits || ipfsJson.attributes)
                                        ? (ipfsJson.traits || ipfsJson.attributes).map((a: any) => ({
                                              key: a.key || a.trait_type || "",
                                              value: a.value || ""
                                          }))
                                        : []
                                });
                            }
                        }
                    } catch (err) {
                        console.log("Error loading metadata json:", err);
                    }
                }

                const txResult = await getNftTransactions(id as string);
                if (txResult.success) {
                    setTransactions(txResult.transactions);
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id])

    const isOwner = !!(account && nft?.owner?.address && account.toLowerCase() === nft.owner.address.toLowerCase());
    
    return (
        <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {loading ? (
                <div className="flex justify-center items-center h-[60vh]">
                    <Loading />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column - Media and Details */}
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

                    {/* Right Column - Marketplace and Stats */}
                    <div className="lg:col-span-7 w-full flex flex-col">
                        {/* Listing Header */}
                        <ListingHeader
                            name={metadata?.name as string}
                            tokenId={nft?.tokenId as string}
                            owner={nft?.owner?.address as string}
                        />

                        {/* Sales Card */}
                        <SaleCard
                            nftPrice={nft?.listing?.price as string}
                            nftAddress={nft?.contractAddress as string}
                            tokenId={nft?.tokenId as string}
                            ownerId={nft?.ownerId as string}
                            nftId={nft?.id as string}
                            isOwner={isOwner}
                            onListClick={() => setIsListModalOpen(true)}
                            onBuyClick={() => setIsBuyModalOpen(true)}
                            onCancelSuccess={refetchNftData}
                        />

                        {/* Price History */}
                        <PriceHistory />

                        {/* Item Activity/Transaction History */}
                        <TransactionHistory transactions={transactions} />

                        {/* List Modal */}
                        {nft && (
                            <ListModal
                                nftId={nft.id}
                                tokenId={nft.tokenId}
                                isOpen={isListModalOpen}
                                onClose={() => setIsListModalOpen(false)}
                                onSuccess={refetchNftData}
                            />
                        )}

                        {/* Buy Modal */}
                        {nft && (
                            <BuyModal
                                nftId={nft.id}
                                tokenId={nft.tokenId}
                                price={nft.listing?.price || "0"}
                                sellerId={nft.owner.address || nft.ownerId}
                                isOpen={isBuyModalOpen}
                                onClose={() => setIsBuyModalOpen(false)}
                                onSuccess={refetchNftData}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

