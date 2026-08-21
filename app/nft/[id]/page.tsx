"use client"

import { useParams } from "next/navigation";
import { useState } from "react";
import Loading from "@/components/ui/Loading";
import ListingHeader from "@/components/features/ListingHeader";
import SaleCard from "@/components/features/SaleCard";
import PriceHistory from "@/components/features/PriceHistory";
import TransactionHistory from "@/components/features/TransactionHistory";
import { useNftDetails, useNftTransactions } from "@/hooks/useNftQueries";
import { useWallet } from "@/contexts/WalletProvider";
import ListModal from "@/components/features/ListModal";
import BuyModal from "@/components/features/BuyModal";
import NftMediaAndDetails from "@/components/features/NftMediaAndDetails";

export default function NftPage() {
    const { id } = useParams();
    const nftIdStr = id as string;

    const { account } = useWallet();
    const { data: nftData, isLoading: isDetailsLoading, refetch: refetchDetails } = useNftDetails(nftIdStr, {
        enabled: !!nftIdStr,
    });
    const { data: txData, isLoading: isTxLoading, refetch: refetchTx } = useNftTransactions(nftIdStr, {
        enabled: !!nftIdStr,
    });

    const nft = nftData?.nft || null;
    const metadata = nftData?.metadata || null;
    const transactions = txData?.success ? txData.transactions : [];
    const loading = isDetailsLoading || isTxLoading;

    const [isListModalOpen, setIsListModalOpen] = useState(false);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

    const refetchNftData = async () => {
        await Promise.all([refetchDetails(), refetchTx()]);
    };

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

