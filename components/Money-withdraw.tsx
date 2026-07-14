"use client"
import React, { useState } from 'react'
import { useWallet } from '@/contexts/WalletProvider'
import { useReadContract, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS, ABI as MARKETPLACE_ABI } from '@/constants/Marketplace';
import { formatEther } from 'viem';
import { Outfit, Staatliches } from "next/font/google";
import Loading from './ui/Loading';

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})
const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

export default function WithdrawEth() {
    const { account, isConnected } = useWallet();
    const [loading, setLoading] = useState(false);

    const { data: rawBalance, refetch: refetchProceeds } = useReadContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI as any,
        functionName: 'getBalance',
        account: account as `0x${string}`,
        query: {
            enabled: !!account && isConnected,
        }
    });

    const balanceStr = rawBalance ? formatEther(rawBalance as bigint) : "0";

    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    async function handleWithdraw() {
        if (!isConnected) {
            return;
        }
        setLoading(true)

        try {
            const txHash = await writeContractAsync({
                address: MARKETPLACE_ADDRESS as `0x${string}`,
                abi: MARKETPLACE_ABI as any,
                functionName: 'withdrawProceeds',
            });

            if (publicClient) {
                await publicClient.waitForTransactionReceipt({ hash: txHash });
            }

            refetchProceeds();

        } catch (error) {
            console.error("Failed to withdraw proceeds:", error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='flex items-center justify-end'>
            <p className={`${outfit.className} mx-4`}>
                <strong>Balance: </strong>{balanceStr != "0" ? balanceStr : 0}
            </p>
            <button
                onClick={handleWithdraw}
                disabled={loading}
                className={`${statliche.className} hover:bg-gradient-to-l hover:from-fuchsia-200 hover:to-sky-300 btn rounded-l text-2xl text-center w-48`}
            >
                {loading ? "withdrowing" : "Withdraw"}

            </button>
            {loading && <Loading />}
        </div>
    )
}
