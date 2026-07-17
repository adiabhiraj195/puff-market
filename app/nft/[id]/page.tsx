"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import { NftInterface, NftMetadataInteface } from "@/types/nft-types";
import { TransactionInterface } from "@/types/transaction-types";
import ListingHeader from "@/components/features/ListingHeader";
import SaleCard from "@/components/features/SaleCard";
import PriceHistory from "@/components/features/PriceHistory";
import TransactionHistory from "@/components/features/TransactionHistory";
import { getNftById, getNftTransactions } from "@/api/nft";
import { useWallet } from "@/contexts/WalletProvider";
import ListModal from "@/components/features/ListModal";
import BuyModal from "@/components/features/BuyModal";
import NftMediaAndDetails from "@/components/features/NftMediaAndDetails";

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
                    <NftMediaAndDetails
                        nft={nft}
                        metadata={metadata}
                    />

                    {/* Right Column - Marketplace and Stats */}
                    <div className="lg:col-span-7 w-full flex flex-col">
                        {/* Listing Header */}
                        <ListingHeader
                            name={metadata?.name as string}
                            tokenId={nft?.tokenId as string}
                            owner={nft?.owner?.address as string}
                            collection={nft?.collection}
                        />

                        {/* Sales Card */}
                        <SaleCard
                            nftPrice={nft?.listing?.price as string}
                            nftAddress={nft?.contractAddress as string}
                            tokenId={nft?.tokenId as string}
                            ownerId={nft?.ownerId as string}
                            nftId={nft?.id as string}
                            paymentToken={nft?.listing?.paymentToken}
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
                                nftAddress={nft.contractAddress}
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
                                paymentToken={nft.listing?.paymentToken}
                                nftAddress={nft.contractAddress}
                            />
                        )}

                    </div>
                </div>
            )}
        </div>
    )
}

