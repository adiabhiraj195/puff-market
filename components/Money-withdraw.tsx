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
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-4 w-full">
            <h3 className="text-lg font-bold text-zinc-200 border-b border-zinc-850 pb-3 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                Escrow Balance
            </h3>
            
            <div className="py-2">
                <span className="text-zinc-500 text-[10px] font-bold tracking-wider uppercase block mb-1">
                    Unclaimed Sales Revenue
                </span>
                <div className="text-3xl font-extrabold text-yellow-400 font-mono flex items-baseline gap-1.5">
                    {balanceStr !== "0" ? balanceStr : "0.00"}{" "}
                    <span className="text-xs font-bold text-zinc-400">ETH</span>
                </div>
            </div>

            <button
                onClick={handleWithdraw}
                disabled={loading || balanceStr === "0"}
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/5 border border-yellow-400/20"
            >
                {loading ? (
                    <div className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                        Withdrawing...
                    </div>
                ) : (
                    "Withdraw Funds"
                )}
            </button>
        </div>
    )
}
