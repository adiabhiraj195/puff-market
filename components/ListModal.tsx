"use client";

import React, { useState } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { parseUnits } from 'viem';
import { PUFF_NFT_ADDRESS, PUFF_NFT_ABI } from '@/constants/PuffNft';
import { CONTRACT_ADDRESS as MARKETPLACE_ADDRESS, ABI as MARKETPLACE_ABI } from '@/constants/Marketplace';
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
  const [tokenType, setTokenType] = useState<'eth' | 'puff' | 'custom'>('eth');
  const [customTokenAddress, setCustomTokenAddress] = useState('');
  const [resolvedTokenSymbol, setResolvedTokenSymbol] = useState('ETH');
  const [resolvedTokenDecimals, setResolvedTokenDecimals] = useState(18);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [tokenValidationError, setTokenValidationError] = useState('');

  const [step, setStep] = useState<1 | 2>(1);
  const [step1State, setStep1State] = useState<TxState>('idle');
  const [step2State, setStep2State] = useState<TxState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  if (!isOpen) return null;

  const validateAndFetchToken = async (address: string) => {
    if (!address.startsWith('0x') || address.length !== 42) {
      setTokenValidationError('Invalid Ethereum address format');
      setResolvedTokenSymbol('');
      return;
    }
    if (!publicClient) return;
    
    setTokenValidationError('');
    setIsValidatingToken(true);
    try {
      const symbol = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: [
          {
            constant: true,
            inputs: [],
            name: 'symbol',
            outputs: [{ name: '', type: 'string' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ] as const,
        functionName: 'symbol',
      });
      
      const decimals = await publicClient.readContract({
        address: address as `0x${string}`,
        abi: [
          {
            constant: true,
            inputs: [],
            name: 'decimals',
            outputs: [{ name: '', type: 'uint8' }],
            payable: false,
            stateMutability: 'view',
            type: 'function',
          },
        ] as const,
        functionName: 'decimals',
      });

      setResolvedTokenSymbol(symbol);
      setResolvedTokenDecimals(Number(decimals));
      setTokenValidationError('');
    } catch (err: any) {
      console.error("[ListModal] Error reading token info:", err);
      setTokenValidationError('Could not resolve token details. Ensure it is a valid ERC-20 contract.');
      setResolvedTokenSymbol('');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const handleList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setErrorMsg('Please enter a valid price greater than 0');
      return;
    }

    if (tokenType === 'custom') {
      if (!customTokenAddress.startsWith('0x') || customTokenAddress.length !== 42) {
        setErrorMsg('Please enter a valid custom ERC-20 contract address');
        return;
      }
      if (!resolvedTokenSymbol) {
        setErrorMsg('Please verify your custom ERC-20 address first');
        return;
      }
    }

    setErrorMsg('');
    try {
      // Convert to base units using decimals
      const decimalsToUse = tokenType === 'custom' ? resolvedTokenDecimals : 18;
      const priceInWei = parseUnits(price, decimalsToUse);
      const tokenAddress = tokenType === 'eth'
        ? '0x0000000000000000000000000000000000000000'
        : (tokenType === 'puff' ? PUFF_TOKEN_ADDRESS : customTokenAddress);

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

      console.log("[ListModal] Step 2: Listing item with token:", tokenAddress);
      const listHash = await writeContractAsync({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI as any,
        functionName: 'listItem',
        args: [PUFF_NFT_ADDRESS as `0x${string}`, BigInt(tokenId), priceInWei, tokenAddress as `0x${string}`],
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
      await createListing(tokenId, price, listHash, tokenAddress);

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
            
            {/* Currency Choice */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Listing Currency</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setTokenType('eth');
                    setResolvedTokenSymbol('ETH');
                    setResolvedTokenDecimals(18);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    tokenType === 'eth'
                      ? 'border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/10'
                      : 'border-zinc-800 bg-[#16171b]/40 text-gray-400 hover:text-white'
                  }`}
                >
                  Ethereum (ETH)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTokenType('puff');
                    setResolvedTokenSymbol('PUFF');
                    setResolvedTokenDecimals(18);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    tokenType === 'puff'
                      ? 'border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/10'
                      : 'border-zinc-800 bg-[#16171b]/40 text-gray-400 hover:text-white'
                  }`}
                >
                  Puff (PUFF)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTokenType('custom');
                    setResolvedTokenSymbol('');
                    setResolvedTokenDecimals(18);
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                    tokenType === 'custom'
                      ? 'border-blue-500 bg-blue-950/20 text-white shadow-md shadow-blue-500/10'
                      : 'border-zinc-800 bg-[#16171b]/40 text-gray-400 hover:text-white'
                  }`}
                >
                  Custom ERC-20
                </button>
              </div>
            </div>

            {/* Custom Token Address Input */}
            {tokenType === 'custom' && (
              <div className="space-y-2">
                <label htmlFor="tokenAddress" className="block text-sm font-medium text-gray-300">
                  ERC-20 Contract Address
                </label>
                <input
                  type="text"
                  id="tokenAddress"
                  value={customTokenAddress}
                  onChange={(e) => {
                    const addr = e.target.value;
                    setCustomTokenAddress(addr);
                    if (addr.length === 42) {
                      validateAndFetchToken(addr);
                    } else {
                      setResolvedTokenSymbol('');
                    }
                  }}
                  className="w-full bg-[#16171b] border border-gray-800 rounded-xl py-3 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
                  placeholder="0x..."
                  required
                />
                {isValidatingToken && (
                  <p className="text-xs text-blue-400 flex items-center gap-1.5 animate-pulse">
                    <span className="animate-spin inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full" />
                    Validating token address...
                  </p>
                )}
                {tokenValidationError && (
                  <p className="text-xs text-red-400">{tokenValidationError}</p>
                )}
                {resolvedTokenSymbol && (
                  <p className="text-xs text-green-400 font-semibold flex items-center gap-1">
                    ✓ Verified: {resolvedTokenSymbol} ({resolvedTokenDecimals} decimals)
                  </p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-300 mb-2">
                Price in {resolvedTokenSymbol || 'Token'}
              </label>
              <div className="relative rounded-md shadow-sm">
                <input
                  type="number"
                  name="price"
                  id="price"
                  step="any"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-[#16171b] border border-gray-800 rounded-xl py-4 px-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g. 1"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-bold">{resolvedTokenSymbol || 'Token'}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={tokenType === 'custom' && !resolvedTokenSymbol}
              className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
