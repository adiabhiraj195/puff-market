"use client"
import React, { useState } from 'react'
import { useWallet } from '@/providers/WalletProvider'
import { useNotification } from '@/providers/NotificationProvider'
import { useCancelListing } from '@/hooks/useNftQueries';
import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS, ABI as MARKETPLACE_ABI } from '@/constants/Marketplace';
import { FiXCircle } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { Outfit } from "@/lib/fonts";

const outfit = Outfit({
    weight: ["400", "600", "700"],
    subsets: ['latin']
})

interface CancelListingButtonProps {
    nftId: string;
    nftAddress: string;
    tokenId: string;
    onSuccess?: () => void;
    className?: string;
}

export default function Cancel_Listing_Button({ 
    nftId, 
    nftAddress, 
    tokenId, 
    onSuccess,
    className = ""
}: CancelListingButtonProps) {
    const { isConnected } = useWallet();
    const { notify } = useNotification();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const cancelListingMutation = useCancelListing();
    const [loading, setLoading] = useState(false);

    async function handleCancel() {
        if (!isConnected) {
            notify.warning("Wallet Not Connected", "Please connect your Web3 wallet to cancel listing.");
            return;
        }

        let toastId = "";
        try {
            setLoading(true);
            toastId = notify.loading("Cancelling Listing...", "Please confirm the transaction in your wallet.");

            const txHash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI as any,
                functionName: 'cancelListing',
                args: [nftAddress as `0x${string}`, BigInt(tokenId)],
            });

            notify.update(toastId, {
                type: "loading",
                title: "Processing Cancellation...",
                message: "Transaction submitted. Waiting for blockchain confirmation...",
            });

            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: txHash });
            }

            await cancelListingMutation.mutateAsync(nftId);
            notify.update(toastId, {
                type: "success",
                title: "Listing Cancelled!",
                message: "NFT listing has been successfully removed from marketplace.",
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error("Failed to cancel listing:", error);
            const errReason = error?.shortMessage || error?.message || "Failed to cancel listing";
            if (toastId) {
                notify.update(toastId, {
                    type: "error",
                    title: "Cancellation Failed",
                    message: errReason,
                });
            } else {
                notify.error("Cancellation Failed", errReason);
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={loading || !isConnected}
            className={`${outfit.className} flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold py-3.5 px-6 rounded-xl w-full shadow-lg hover:shadow-red-500/25 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-red-600 disabled:hover:to-rose-600 disabled:active:scale-100 ${className}`}
        >
            {loading ? (
                <>
                    <CgSpinner className="animate-spin text-xl" />
                    <span>Cancelling...</span>
                </>
            ) : (
                <>
                    <span>Cancel Listing</span>
                    <FiXCircle size={18} />
                </>
            )}
        </button>
    )
}

