"use client";

import React, { useState, useEffect } from 'react';
import {
  useWriteContract,
  usePublicClient,
  useAccount,
  useReadContract,
  useBalance,
  useChainId,
  useSignTypedData,
} from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { parseUnits, parseSignature, zeroAddress } from 'viem';
import { useWallet } from '@/contexts/WalletProvider';
import { useNotification } from '@/contexts/NotificationContext';
import {
  PUFF_TOKEN_ADDRESS,
  PUFF_TOKEN_ABI,
  PUFF_TOKEN_PERMIT_NAME,
  PUFF_TOKEN_PERMIT_VERSION,
  MARKETPLACE_ADDRESS,
  MARKETPLACE_ABI,
  PUFF_NFT_ADDRESS,
} from '@/constants/contracts';
import FaucetModal from '@/components/features/FaucetModal';
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
  nftAddress?: string;
}

type TxState = 'idle' | 'signing' | 'pending' | 'confirmed' | 'error';

export default function BuyModal({ nftId, tokenId, price, sellerId, isOpen, onClose, onSuccess, paymentToken, nftAddress }: BuyModalProps) {

  const { puffBalance, refetchBalance } = useWallet();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { signTypedDataAsync } = useSignTypedData();
  const queryClient = useQueryClient();

  const [usePermit, setUsePermit] = useState<boolean>(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [step1State, setStep1State] = useState<TxState>('idle');
  const [step2State, setStep2State] = useState<TxState>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const { notify } = useNotification();

  const tokenAddress = paymentToken || "0x0000000000000000000000000000000000000000";
  const isEth = tokenAddress === "0x0000000000000000000000000000000000000000";
  const isPuff = !isEth && tokenAddress.toLowerCase() === PUFF_TOKEN_ADDRESS.toLowerCase();

  // Reset permit setting based on whether token is PUFF when modal opens
  useEffect(() => {
    if (isOpen) {
      setUsePermit(isPuff);
    }
  }, [isOpen, isPuff]);

  // Read buyer's current nonce from PuffToken
  const { data: nonce, isLoading: isNonceLoading } = useReadContract({
    address: PUFF_TOKEN_ADDRESS as `0x${string}`,
    abi: PUFF_TOKEN_ABI as any,
    functionName: "nonces",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress && isOpen },
  });


  const {
    writeContractAsync: buyWithPermit,
    isPending: isPermitBuyPending,
  } = useWriteContract();

  // Used for both ETH buys and standard ERC20 buys:
  const {
    writeContractAsync: buyStandard,
    isPending: isStandardBuyPending,
  } = useWriteContract();

  const {
    writeContractAsync: approveSpender,
    isPending: isApprovePending,
  } = useWriteContract();

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
      : (rawBalance !== undefined ? (Number(rawBalance) / 10 ** decimals).toLocaleString(undefined, { maximumFractionDigits: 4 }) : '0'));

  const balanceFloat = isEth
    ? (ethBalanceData ? Number(ethBalanceData.formatted) : 0)
    : (isPuff
      ? (parseFloat(puffBalance.replace(/,/g, '')) || 0)
      : (rawBalance !== undefined ? Number(rawBalance) / 10 ** decimals : 0));

  const isInsufficientBalance = balanceFloat < Number(price);

  const isEthPayment = isEth;
  const isLoading = isPermitBuyPending || isStandardBuyPending || isApprovePending;
  const listing = {
    price: parseUnits(price, decimals),
    paymentToken: tokenAddress
  };

  console.log("[BuyModal] Render variables:", {
    isOpen,
    userAddress,
    chainId,
    nonce: nonce !== undefined && nonce !== null ? nonce.toString() : "undefined",
    isNonceLoading,
    usePermit,
    isPuff,
    isEth,
    isLoading,
    isInsufficientBalance,
    hasPublicClient: !!publicClient
  });

  const handleBuy = async () => {
    console.log("[BuyModal] handleBuy triggered!", {
      isInsufficientBalance,
      listing,
      userAddress,
      hasPublicClient: !!publicClient,
      usePermit
    });
    if (isInsufficientBalance) return;
    if (!listing || !userAddress) return;
    setErrorMsg('');

    const targetNftAddress = (nftAddress || PUFF_NFT_ADDRESS) as `0x${string}`;

    try {
      // ── ETH path (unchanged) ──────────────────────────────────────
      if (isEthPayment) {
        setStep(2);
        setStep2State('signing');
        console.log("[BuyModal] Buying NFT with ETH... at price : ", listing.price);

        const buyHash = await buyStandard({
          address: MARKETPLACE_ADDRESS as `0x${string}`,
          abi: MARKETPLACE_ABI as any,
          functionName: 'buyItem',
          args: [targetNftAddress, BigInt(tokenId)],
          value: listing.price,
          gas: 500000n,
        });

        setStep2State('pending');
        console.log("[BuyModal] Buy tx hash:", buyHash);

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: buyHash });
        }
        setStep2State('confirmed');
        console.log("[BuyModal] Buy confirmed!");

        // Update backend database immediately
        try {
          console.log("[BuyModal] Informing backend database of purchase...");
          await buyNft(nftId, { sellerId, txHash: buyHash, price });
        } catch (backendErr) {
          console.error("[BuyModal] Backend sync failed, but transaction succeeded on-chain:", backendErr);
        }

        queryClient.invalidateQueries({ queryKey: ["listing", targetNftAddress, tokenId] });

        // Success
        refetchBalance();
        refetchEthBalance();
        notify.success("NFT Purchased Successfully!", `You have successfully bought Token #${tokenId} for ${price} ETH!`);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
        return;
      }

      // ── ERC20 permit path ─────────────────────────────────────────
      if (usePermit) {
        setStep(1);
        setStep1State('signing');
        console.log(`[BuyModal] Step 1: Requesting EIP-712 Permit signature for ${symbol}...`);

        // 1. Build deadline (30 minutes from now)
        const deadline = BigInt(Math.floor(Date.now() / 1000) + 1800);

        // 2. Sign the EIP-2612 permit using Wagmi's useSignTypedData hook
        const signature = await signTypedDataAsync({
          domain: {
            name: PUFF_TOKEN_PERMIT_NAME,       // "PuffToken"
            version: PUFF_TOKEN_PERMIT_VERSION,  // "1"
            chainId: chainId === 1337 ? 31337 : chainId,
            verifyingContract: PUFF_TOKEN_ADDRESS as `0x${string}`,
          },
          types: {
            Permit: [
              { name: "owner", type: "address" },
              { name: "spender", type: "address" },
              { name: "value", type: "uint256" },
              { name: "nonce", type: "uint256" },
              { name: "deadline", type: "uint256" },
            ],
          },
          primaryType: "Permit",
          message: {
            owner: userAddress as `0x${string}`,
            spender: MARKETPLACE_ADDRESS as `0x${string}`,
            value: listing.price,
            nonce: nonce !== undefined && nonce !== null ? BigInt(nonce as any) : 0n,
            deadline: deadline,
          },
        });

        setStep1State('confirmed');
        console.log("[BuyModal] EIP-712 Permit signature obtained!");

        // 3. Split signature into v, r, s using viem
        const { v, r, s } = parseSignature(signature);

        // 4. Send the single buyItemWithPermit transaction
        setStep(2);
        setStep2State('signing');
        console.log("[BuyModal] Step 2: Submitting buyItemWithPermit transaction...");

        const buyHash = await buyWithPermit({
          address: MARKETPLACE_ADDRESS as `0x${string}`,
          abi: MARKETPLACE_ABI as any,
          functionName: "buyItemWithPermit",
          args: [
            targetNftAddress,
            BigInt(tokenId),
            {
              owner: userAddress as `0x${string}`,
              spender: MARKETPLACE_ADDRESS as `0x${string}`,
              value: listing.price,
              deadline,
              v: v !== null && v !== undefined ? Number(v) : 0,
              r,
              s,
            },
          ],
        });

        setStep2State('pending');
        console.log("[BuyModal] buyItemWithPermit tx hash:", buyHash);

        if (publicClient) {
          await publicClient.waitForTransactionReceipt({ hash: buyHash });
        }
        setStep2State('confirmed');
        console.log("[BuyModal] buyItemWithPermit transaction confirmed!");

        // Update backend database immediately
        try {
          console.log("[BuyModal] Informing backend database of purchase...");
          await buyNft(nftId, { sellerId, txHash: buyHash, price });
        } catch (backendErr) {
          console.error("[BuyModal] Backend sync failed, but transaction succeeded on-chain:", backendErr);
        }

        queryClient.invalidateQueries({ queryKey: ["listing", targetNftAddress, tokenId] });

        // Success
        refetchBalance();
        refetchTokenBalance();
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
        return;
      }

      // ── ERC20 standard flow (Approve + Buy) ────────────────────────
      setStep(1);
      setStep1State('signing');
      console.log(`[BuyModal] Step 1: Approving spending...`);

      const approveHash = await approveSpender({
        address: tokenAddress as `0x${string}`,
        abi: PUFF_TOKEN_ABI as any,
        functionName: 'approve',
        args: [MARKETPLACE_ADDRESS as `0x${string}`, listing.price],
      });

      setStep1State('pending');
      console.log("[BuyModal] Approve tx hash:", approveHash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: approveHash });
      }
      setStep1State('confirmed');
      console.log("[BuyModal] Approve confirmed!");

      setStep(2);
      setStep2State('signing');
      console.log("[BuyModal] Step 2: Buying NFT...");

      const buyHash = await buyStandard({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI as any,
        functionName: 'buyItem',
        args: [targetNftAddress, BigInt(tokenId)],
        value: 0n,
        gas: 500000n,
      });

      setStep2State('pending');
      console.log("[BuyModal] Buy tx hash:", buyHash);

      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: buyHash });
      }
      setStep2State('confirmed');
      console.log("[BuyModal] Buy confirmed!");

      // Update backend database immediately
      try {
        console.log("[BuyModal] Informing backend database of purchase...");
        await buyNft(nftId, { sellerId, txHash: buyHash, price });
      } catch (backendErr) {
        console.error("[BuyModal] Backend sync failed, but transaction succeeded on-chain:", backendErr);
      }

      queryClient.invalidateQueries({ queryKey: ["listing", targetNftAddress, tokenId] });

      // Success
      refetchBalance();
      refetchTokenBalance();
      notify.success("NFT Purchased Successfully!", `You have successfully bought Token #${tokenId} for ${price} ${symbol}!`);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);

    } catch (err: any) {
      console.error("[BuyModal] Purchase failed:", err);
      const userErr = err?.shortMessage ?? err?.message ?? "Transaction failed";
      // Distinguish signature rejection from transaction revert
      if (err?.code === 4001 || err?.name === "UserRejectedRequestError") {
        setErrorMsg("Signature rejected");
        notify.error("Transaction Rejected", "Signature was rejected in your wallet.");
        if (step === 1) setStep1State('error');
        if (step === 2) setStep2State('error');
        return;
      }
      if (err?.message?.includes("Permit expired")) {
        setErrorMsg("Your permit expired, please try again");
        notify.error("Permit Expired", "Your permit signature expired. Please try again.");
        if (step === 1) setStep1State('error');
        if (step === 2) setStep2State('error');
        return;
      }
      setErrorMsg(userErr);
      notify.error("Purchase Failed", userErr);
      if (step === 1) setStep1State('error');
      if (step === 2) setStep2State('error');
    }
  };

  const getStatusText = (state: TxState, currentStep?: number) => {
    if (currentStep === 1 && !isEth) {
      if (usePermit) {
        switch (state) {
          case 'signing':
            return 'Requesting permit signature from wallet...';
          case 'confirmed':
            return 'Permit signed!';
          case 'error':
            return 'Signature rejected or failed';
          default:
            return 'Waiting...';
        }
      } else {
        switch (state) {
          case 'signing':
            return 'Requesting approval transaction signature...';
          case 'pending':
            return 'Approval transaction pending confirmation on-chain...';
          case 'confirmed':
            return 'Spender approved!';
          case 'error':
            return 'Approval failed or rejected';
          default:
            return 'Waiting...';
        }
      }
    }
    switch (state) {
      case 'signing':
        return 'Requesting purchase signature...';
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

  const getButtonText = () => {
    if (isLoading) {
      if (isEth) return "Buying...";
      if (usePermit) return "Sign & Buy...";
      if (isApprovePending) return "Approving...";
      return "Buying...";
    }
    if (usePermit && (nonce === undefined || isNonceLoading)) {
      return "Loading Wallet Data...";
    }
    if (isEth) return "Buy with ETH";
    return usePermit ? `Sign & Buy with ${symbol}` : `Approve & Buy with ${symbol}`;
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

        {!isEth && isPuff && !isProcessing && (
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
              Payment Authorization Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Permit Method Card */}
              <button
                type="button"
                onClick={() => setUsePermit(true)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${usePermit
                    ? 'border-purple-500 bg-purple-950/20 text-white shadow-[0_0_12px_rgba(168,85,247,0.15)]'
                    : 'border-gray-800 bg-[#16171b]/60 hover:bg-[#16171b] text-gray-400 hover:text-gray-200'
                  }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="font-bold text-sm">Permit Flow</span>
                  {usePermit && (
                    <span className="text-[10px] font-black uppercase bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-md">
                      Recommended
                    </span>
                  )}
                </div>
                <span className="text-[11px] leading-snug opacity-80">
                  Sign off-chain (gasless permit), then buy in 1 transaction.
                </span>
              </button>

              {/* Approve Method Card */}
              <button
                type="button"
                onClick={() => setUsePermit(false)}
                className={`flex flex-col text-left p-3.5 rounded-xl border transition-all duration-200 ${!usePermit
                    ? 'border-blue-500 bg-blue-950/20 text-white shadow-[0_0_12px_rgba(59,130,246,0.15)]'
                    : 'border-gray-800 bg-[#16171b]/60 hover:bg-[#16171b] text-gray-400 hover:text-gray-200'
                  }`}
              >
                <div className="font-bold text-sm mb-1">Standard Flow</div>
                <span className="text-[11px] leading-snug opacity-80">
                  Approve spending on-chain (gas cost), then purchase in 2nd tx.
                </span>
              </button>
            </div>
          </div>
        )}

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
                disabled={isLoading || !listing || (usePermit && (nonce === undefined || isNonceLoading))}
                className="w-full py-4 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg hover:shadow-blue-600/20 transition-all duration-200"
              >
                {getButtonText()}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {!isEth && (
              /* Step 1 spender authorization via Permit signature or Standard approval */
              <div className={`p-4 rounded-xl border transition-all duration-300 ${step === 1 ? 'border-blue-500 bg-blue-950/10' : 'border-gray-800 bg-[#16171b]/20 opacity-60'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-lg flex items-center gap-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step1State === 'confirmed' ? 'bg-green-600' : 'bg-blue-600 text-white'}`}>
                      {step1State === 'confirmed' ? '✓' : '1'}
                    </span>
                    {usePermit ? `Step 1: Sign ${symbol} Permit` : `Step 1: Approve ${symbol} Spending`}
                  </span>
                  <span className="text-xs font-medium uppercase text-blue-400">1 of 2</span>
                </div>
                <p className="text-gray-400 text-xs mb-3">
                  {usePermit
                    ? `Sign an off-chain permit to authorize spending of ${symbol} (gas-free).`
                    : `Grant the marketplace contract permission to spend your ${symbol}.`}
                </p>
                {step1State !== 'idle' && (
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {step1State === 'signing' || step1State === 'pending' ? (
                      <span className="animate-spin inline-block w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
                    ) : null}
                    <span className={step1State === 'confirmed' ? 'text-green-400' : step1State === 'error' ? 'text-red-400' : 'text-blue-400'}>
                      {getStatusText(step1State, 1)}
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
