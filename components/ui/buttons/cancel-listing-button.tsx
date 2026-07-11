"use client"
import React from 'react'
import { useWallet } from '@/contexts/WalletProvide'
import { cancelListing } from '@/api/nft';
import { ethers } from 'ethers';
import { MarketContract } from '@/lib/ethersContract';

import { Outfit, Staatliches } from "@next/font/google";

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

export default function Cancel_Listing_Button({ nftId, nftAddress, tokenId }: {
    nftId: string;
    nftAddress: string;
    tokenId: string;
}) {
    const { isConnected, signer } = useWallet();

    async function handleCancel() {
        if (!isConnected) {
            return
        }

        try {
            const marketContract = MarketContract(signer)

            const tx = await marketContract.cancelListing(nftAddress, tokenId);
            await tx.wait();

            await cancelListing(nftId);

            console.log("canceled")
        } catch (error) {

        }
    }
    return (
        <button
            onClick={handleCancel}
            className={`${statliche.className} hover:bg-gradient-to-l hover:from-fuchsia-200 hover:to-sky-300 btn rounded-l text-2xl text-center w-48`}
        >
            Cancel Listing
        </button>
    )
}
