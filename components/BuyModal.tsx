"use client";

import React, { useState } from 'react';
import { useWriteContract, usePublicClient, useAccount, useReadContract, useBalance } from 'wagmi';
import { parseUnits } from 'viem';
import { useWallet } from '@/contexts/WalletProvider';
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from '@/constants/PuffToken';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS } from '@/constants/Marketplace';
import { PUFF_NFT_ADDRESS } from '@/constants/PuffNft';
import { ABI as MARKETPLACE_ABI } from '@/constants/Marketplace';
import FaucetModal from '@/components/FaucetModal';
import { buyNft } from '@/api/nft';

interface BuyModalProps {
  nftId: string;
  tokenId: string;
  price: string; // human units, e.g. "1000"
  sellerId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentToken?: string;
}

type TxState = 'idle' | 'signing' | 'pending' | 'confirmed' | 'error';

export default function BuyModal({ nftId, tokenId, price, sellerId, isOpen, onClose, onSuccess, paymentToken }: BuyModalProps) {

  const { puffBalance, refetchBalance } = useWallet();
  const { address: userAddress } = useAccount();
  const [step, setStep] = useState<1 | 2>(1);
  const [step1State, setStep1State] = useState<TxState>('idle');
  const [step2State, setStep2State] = useState<TxState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const tokenAddress = paymentToken || "0x0000000000000000000000000000000000000000";
  const isEth = tokenAddress === "0x0000000000000000000000000000000000000000";
  const isPuff = !isEth && tokenAddress.toLowerCase() === PUFF_TOKEN_ADDRESS.toLowerCase();

  // Fetch ETH balance if native listing
  const { data: ethBalanceData, refetch: refetchEthBalance } = useBalance({
    address: userAddress,
    query: {
      enabled: isEth && !!userAddress && isOpen,
    }
  });

  // Fetch token symbol if custom token
  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [{ constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
    functionName: 'symbol',
    query: {
      enabled: !isEth && !isPuff && !!tokenAddress && isOpen,
    }
  });

  // Fetch token decimals if custom token
  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [{ constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
    functionName: 'decimals',
    query: {
      enabled: !isEth && !isPuff && !!tokenAddress && isOpen,
    }
  });

  // Fetch custom token balance
  const { data: rawBalance, refetch: refetchTokenBalance } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [{ constant: true, inputs: [{ name: '_owner', type: 'address' }], name: 'balanceOf', outputs: [{ name: 'balance', type: 'uint256' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !isEth && !isPuff && !!tokenAddress && !!userAddress && isOpen,
    }
  });

  if (!isOpen) return null;

  const decimals = isEth ? 18 : (isPuff ? 18 : (Number(tokenDecimals) || 18));
  const symbol = isEth ? 'ETH' : (isPuff ? 'PUFF' : (tokenSymbol || 'Token'));

  const formattedBalance = isEth
    ? (ethBalanceData ? Number(ethBalanceData.formatted).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0')
    : (isPuff 
       ? puffBalance 
       : (rawBalance !== undefined ? (Number(rawBalance) / 10**decimals).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'));

  const balanceFloat = isEth
    ? (ethBalanceData ? Number(ethBalanceData.formatted) : 0)
    : (isPuff
       ? (parseFloat(puffBalance.replace(/,/g, '')) || 0)
       : (rawBalance !== undefined ? Number(rawBalance) / 10**decimals : 0));

  const isInsufficientBalance = balanceFloat < Number(price);

  const handleBuy = async () => {
    if (isInsufficientBalance) return;
    setErrorMsg('');

    try {
      const priceInWei = parseUnits(price, decimals);

      if (!isEth) {
        // --- STEP 1: APPROVE SPENDING ---
        setStep(1);
        setStep1State('signing');
        console.log(`[BuyModal] Step 1: Approving ${symbol} token spending...`);

        const approveHash = await writeContractAsync({
          address: tokenAddress as `0x${string}`,
          abi: PUFF_TOKEN_ABI as any,
          functionName: 'approve',
          args: [MARKETPLACE_ADDRESS as `0x${string}`, priceInWei],
        });

        setStep1State('pending');
        console.log("[BuyModal] Step 1 Approve tx hash:", approveHash);

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        setStep1State('confirmed');
        console.log("[BuyModal] Step 1 Approve confirmed!");
      } else {
        // For ETH, approval is skipped
        setStep1State('confirmed');
      }

      // --- STEP 2: BUY ITEM ---
      setStep(2);
      setStep2State('signing');
      console.log("[BuyModal] Step 2: Buying NFT... at price : ", priceInWei);

      const buyHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI as any,
        functionName: 'buyItem',
        args: [PUFF_NFT_ADDRESS as `0x${string}`, BigInt(tokenId)],
        value: isEth ? priceInWei : 0n,
        gas: 500000n,
      });

      setStep2State('pending');
      console.log("[BuyModal] Step 2 Buy tx hash:", buyHash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: buyHash });
      }
      setStep2State('confirmed');
      console.log("[BuyModal] Step 2 Buy confirmed!");

      // Update backend database immediately
      try {
        console.log("[BuyModal] Informing backend database of purchase...");
        await buyNft(nftId, { sellerId, txHash: buyHash, price });
      } catch (backendErr) {
        console.error("[BuyModal] Backend sync failed, but transaction succeeded on-chain:", backendErr);
      }

      // Success
      refetchBalance();
      refetchTokenBalance();
      refetchEthBalance();
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("[BuyModal] Purchase failed:", err);
      setErrorMsg(err.shortMessage || err.message || 'Transaction failed. Please try again.');
      if (step === 1) setStep1State('error');
      if (step === 2) setStep2State('error');
    }
  };

  const getStatusText = (state: TxState) => {
    switch (state) {
      case 'signing':
        return 'Requesting user signature...';
      case 'pending':
        return 'Transaction pending confirmation on-chain...';
      case 'confirmed':
        return 'Transaction Confirmed!';
      case 'error':
        return 'Error occurred';
      default:
        return 'Waiting...';
    }
  };

  const isProcessing = step1State !== 'idle' || step2State !== 'idle';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-gray-800 bg-[#0c0d10] p-8 shadow-2xl text-white">

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing && step2State !== 'confirmed'}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Close modal"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold mb-2 tracking-tight">Purchase NFT</h2>
        <p className="text-gray-400 text-sm mb-6">Complete the transactions to buy this NFT from the marketplace.</p>

        {errorMsg && (
          <div className="p-3 mb-6 rounded-lg bg-red-950/50 border border-red-500/50 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <div className="bg-[#16171b] border border-gray-800 rounded-xl p-4 mb-6 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Price:</span>
            <span className="font-bold text-white text-lg">{Number(price).toLocaleString()} {symbol}</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-gray-800 pt-3">
            <span className="text-gray-400">Your Balance:</span>
            <span className={`font-bold text-lg ${isInsufficientBalance ? 'text-red-400' : 'text-green-400'}`}>
              {formattedBalance} {symbol}
            </span>
          </div>
        </div>

        {!isProcessing ? (
          <div className="space-y-4">
            {isInsufficientBalance ? (
              <div className="flex flex-col gap-4">
                <div className="p-3 rounded-lg bg-yellow-950/30 border border-yellow-500/30 text-yellow-400 text-xs text-center">
                  You do not have enough {symbol} tokens to buy this NFT.
                </div>
                {isPuff && (
                  <button
                    onClick={() => setIsFaucetOpen(true)}
                    className="w-full py-4 px-6 rounded-xl bg-[#c084fc] hover:bg-[#a855f7] text-[#0c0d10] font-black text-lg shadow-lg hover:shadow-purple-500/20 transition-all duration-200"
                  >
                    Get PUFF first
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={handleBuy}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
              >
                Buy for {Number(price).toLocaleString()} {symbol}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {!isEth && (
              /* Step 1 spender authorization */
              <div className={`p-4 rounded-xl border transition-all duration-300 ${step === 1 ? 'border-blue-500 bg-blue-950/10' : 'border-gray-800 bg-[#16171b]/20 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step1State === 'confirmed' ? 'bg-green-600' : 'bg-blue-600 text-white'}`}>
                      {step1State === 'confirmed' ? '✓' : '1'}
                    </span>
                    Step 1: Approve {symbol} Spending
                  </span>
                  <span className="text-xs font-medium uppercase text-blue-400">1 of 2</span>
                </div>
                <p className="text-gray-400 text-xs mb-3">Grant the marketplace contract permission to spend your {symbol}.</p>
                {step1State !== 'idle' && (
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {step1State === 'signing' || step1State === 'pending' ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                    ) : null}
                    <span className={step1State === 'confirmed' ? 'text-green-400' : step1State === 'error' ? 'text-red-400' : 'text-blue-400'}>
                      {getStatusText(step1State)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Step 2 purchase invocation */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${isEth || step === 2 ? 'border-blue-500 bg-blue-950/10' : 'border-gray-800 bg-[#16171b]/20 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step2State === 'confirmed' ? 'bg-green-600' : isEth ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                    {step2State === 'confirmed' ? '✓' : isEth ? '1' : '2'}
                  </span>
                  {isEth ? 'Purchase NFT' : 'Step 2: Purchase NFT'}
                </span>
                <span className="text-xs font-medium uppercase text-gray-500">{isEth ? '1 of 1' : '2 of 2'}</span>
              </div>
              <p className="text-gray-400 text-xs mb-3">Execute the final contract trade transaction.</p>
              {step2State !== 'idle' && (
                <div className="text-sm font-semibold flex items-center gap-2">
                  {step2State === 'signing' || step2State === 'pending' ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  ) : null}
                  <span className={step2State === 'confirmed' ? 'text-green-400' : step2State === 'error' ? 'text-red-400' : 'text-blue-400'}>
                    {step2State === 'confirmed' ? 'You now own this NFT!' : getStatusText(step2State)}
                  </span>
                </div>
              )}
            </div>

            {step2State === 'confirmed' && (
              <div className="text-center font-bold text-green-400 animate-bounce text-lg">
                🎉 You now own this NFT!
              </div>
            )}
          </div>
        )}

        {/* FaucetModal Integration */}
        <FaucetModal
          isOpen={isFaucetOpen}
          onClose={() => {
            setIsFaucetOpen(false);
            refetchBalance();
          }}
        />
      </div>
    </div>
  );
}
