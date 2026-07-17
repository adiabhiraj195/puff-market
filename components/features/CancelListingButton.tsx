"use client"
import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletProvider'
import { cancelListing } from '@/api/nft';
import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS, ABI as MARKETPLACE_ABI } from '@/constants/Marketplace';

import { Outfit, Staatliches } from "@/lib/fonts";

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

export default function Cancel_Listing_Button({ nftId, nftAddress, tokenId, onSuccess }: {
    nftId: string;
    nftAddress: string;
    tokenId: string;
    onSuccess?: () => void;
}) {
    const { isConnected } = useWallet();
    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();
    const [loading, setLoading] = useState(false);

    async function handleCancel() {
        if (!isConnected) {
            return
        }

        try {
            setLoading(true);
            const txHash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI as any,
                functionName: 'cancelListing',
                args: [nftAddress as `0x${string}`, BigInt(tokenId)],
            });

            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: txHash });
            }

            await cancelListing(nftId);
            console.log("canceled")
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to cancel listing:", error);
        } finally {
            setLoading(false);
        }
    }
    return (
        <button
            onClick={handleCancel}
            disabled={loading}
            className={`${statliche.className} hover:bg-gradient-to-l hover:from-fuchsia-200 hover:to-sky-300 btn rounded-l text-2xl text-center w-48 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {loading ? "Cancelling..." : "Cancel Listing"}
        </button>
    )
}
