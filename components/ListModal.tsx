"use client";

import React, { useState } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { parseEther } from 'viem';
import { PUFF_NFT_ADDRESS, PUFF_NFT_ABI } from '@/constants/PuffNft';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS, ABI as MARKETPLACE_ABI } from '@/constants/contractConfig';
import { createListing } from '@/api/nft';
import { PUFF_TOKEN_ADDRESS } from '@/constants/PuffToken';

interface ListModalProps {
  nftId: string;
  tokenId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type TxState = 'idle' | 'signing' | 'pending' | 'confirmed' | 'error';

export default function ListModal({ nftId, tokenId, isOpen, onClose, onSuccess }: ListModalProps) {
  const [price, setPrice] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [step1State, setStep1State] = useState<TxState>('idle');
  const [step2State, setStep2State] = useState<TxState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  if (!isOpen) return null;

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price greater than 0');
      return;
    }

    setErrorMsg('');
    try {
      // Convert PUFF to Wei
      const priceInWei = parseEther(price);

      // --- STEP 1: APPROVAL ---
      setStep(1);
      setStep1State('signing');
      
      console.log("[ListModal] Step 1: Approving marketplace...");
      const approveHash = await writeContractAsync({
        address: PUFF_NFT_ADDRESS as `0x${string}`,
        abi: PUFF_NFT_ABI as any,
        functionName: 'approve',
        args: [MARKETPLACE_ADDRESS as `0x${string}`, BigInt(tokenId)],
      });

      setStep1State('pending');
      console.log("[ListModal] Step 1 Approval tx hash:", approveHash);
      
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      setStep1State('confirmed');
      console.log("[ListModal] Step 1 Approval confirmed!");

      // --- STEP 2: LISTING ---
      setStep(2);
      setStep2State('signing');

      console.log("[ListModal] Step 2: Listing item...");
      const listHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI as any,
        functionName: 'listItem',
        args: [PUFF_NFT_ADDRESS as `0x${string}`, BigInt(tokenId), priceInWei, PUFF_TOKEN_ADDRESS as `0x${string}`],
      });

      setStep2State('pending');
      console.log("[ListModal] Step 2 Listing tx hash:", listHash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: listHash });
      }
      setStep2State('confirmed');
      console.log("[ListModal] Step 2 Listing confirmed!");

      // --- STEP 3: BACKEND NOTIFICATION ---
      console.log("[ListModal] Sending listing details to backend...");
      await createListing(tokenId, price, listHash);

      // Success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("[ListModal] Transaction failed:", err);
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

        <h2 className="text-3xl font-bold mb-2 tracking-tight">List NFT for Sale</h2>
        <p className="text-gray-400 text-sm mb-6">List your token on the PUFF Marketplace. You will be asked to sign two transactions.</p>

        {errorMsg && (
          <div className="p-3 mb-6 rounded-lg bg-red-950/50 border border-red-500/50 text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        {!isProcessing ? (
          <form onSubmit={handleList} className="space-y-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">Price in PUFF</label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#16171b] border border-gray-800 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 1000"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">PUFF</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
            >
              List Item
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            
            {/* Step 1 indicator */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${step === 1 ? 'border-blue-500 bg-blue-950/10' : 'border-gray-800 bg-[#16171b]/20 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step1State === 'confirmed' ? 'bg-green-600' : 'bg-blue-600 text-white'}`}>
                    {step1State === 'confirmed' ? '✓' : '1'}
                  </span>
                  Step 1: Approve Marketplace
                </span>
                <span className="text-xs font-medium uppercase text-blue-400">1 of 2</span>
              </div>
              <p className="text-gray-400 text-xs mb-3">Authorize the marketplace contract to handle your NFT.</p>
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

            {/* Step 2 indicator */}
            <div className={`p-4 rounded-xl border transition-all duration-300 ${step === 2 ? 'border-blue-500 bg-blue-950/10' : 'border-gray-800 bg-[#16171b]/20 opacity-60'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-lg flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step2State === 'confirmed' ? 'bg-green-600' : 'bg-gray-700'}`}>
                    {step2State === 'confirmed' ? '✓' : '2'}
                  </span>
                  Step 2: List Item
                </span>
                <span className="text-xs font-medium uppercase text-gray-500">2 of 2</span>
              </div>
              <p className="text-gray-400 text-xs mb-3">Sign the transaction to place your NFT on sale.</p>
              {step2State !== 'idle' && (
                <div className="text-sm font-semibold flex items-center gap-2">
                  {step2State === 'signing' || step2State === 'pending' ? (
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                  ) : null}
                  <span className={step2State === 'confirmed' ? 'text-green-400' : step2State === 'error' ? 'text-red-400' : 'text-blue-400'}>
                    {step2State === 'confirmed' ? '2 of 2 — Listed!' : getStatusText(step2State)}
                  </span>
                </div>
              )}
            </div>

            {step2State === 'confirmed' && (
              <div className="text-center font-bold text-green-400 animate-bounce">
                🎉 Successfully Listed!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
