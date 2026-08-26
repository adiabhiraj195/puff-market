"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from '@/constants/PuffToken';
import { useWallet } from '@/providers/WalletProvider';
import { useNotification } from '@/providers/NotificationProvider';
import { IoClose } from 'react-icons/io5';
import { Staatliches, Outfit } from '@/lib/fonts';

const statliche = Staatliches({
  weight: ["400"],
  subsets: ['latin']
});

const outfit = Outfit({
  weight: ["300", "400", "600", "700"],
  subsets: ['latin']
});

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FaucetModal({ isOpen, onClose }: FaucetModalProps) {
  const { address } = useAccount();
  const { refetchBalance } = useWallet();

  const [mounted, setMounted] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Read: PuffToken.hasClaimedBonus(address)
  const { data: hasClaimedBonus, refetch: refetchHasClaimedBonus } = useReadContract({
    address: PUFF_TOKEN_ADDRESS as `0x${string}`,
    abi: PUFF_TOKEN_ABI as any,
    functionName: 'hasClaimedBonus',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isOpen,
    }
  });

  // 2. Read: PuffToken.lastFaucetClaim(address)
  const { data: lastFaucetClaim, refetch: refetchLastFaucetClaim } = useReadContract({
    address: PUFF_TOKEN_ADDRESS as `0x${string}`,
    abi: PUFF_TOKEN_ABI as any,
    functionName: 'lastFaucetClaim',
    args: address ? [address as `0x${string}`] : undefined,
    query: {
      enabled: !!address && isOpen,
    }
  });

  // 3. Write: PuffToken.faucet()
  const { data: hash, error: writeError, isPending: isWritePending, writeContract, reset: resetWrite } = useWriteContract();

  // 4. Wait for confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Local state tracking before first-time claim resets hasClaimedBonus on chain
  const [wasFirstClaim, setWasFirstClaim] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && hasClaimedBonus !== undefined) {
      setWasFirstClaim(!hasClaimedBonus);
    }
  }, [isOpen, hasClaimedBonus]);

  // Cooldown calculation & countdown timer logic
  useEffect(() => {
    if (!lastFaucetClaim) {
      setSecondsLeft(0);
      return;
    }
    const lastClaimTime = Number(lastFaucetClaim);
    if (lastClaimTime === 0) {
      setSecondsLeft(0);
      return;
    }

    const calculateRemaining = () => {
      const now = Math.floor(Date.now() / 1000);
      const cooldownPeriod = 24 * 60 * 60; // 24 hours
      const diff = (lastClaimTime + cooldownPeriod) - now;
      return diff > 0 ? diff : 0;
    };

    // Set initial remaining seconds
    const initialDiff = calculateRemaining();
    setSecondsLeft(initialDiff);

    if (initialDiff <= 0) return;

    const interval = setInterval(() => {
      const diff = calculateRemaining();
      setSecondsLeft(diff);
      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFaucetClaim, isOpen]);

  // Determine transaction lifecycle state
  const [txState, setTxState] = useState<'idle' | 'signing' | 'pending' | 'confirmed' | 'error'>('idle');
  const { notify } = useNotification();
  const [faucetToastId, setFaucetToastId] = useState<string>('');

  useEffect(() => {
    if (isWritePending) {
      setTxState('signing');
      const tid = notify.loading("Claiming Faucet Tokens...", "Please confirm the transaction in your wallet.");
      setFaucetToastId(tid);
    } else if (hash && isConfirming) {
      setTxState('pending');
      if (faucetToastId) {
        notify.update(faucetToastId, {
          type: "loading",
          title: "Processing Claim...",
          message: "Transaction submitted. Awaiting block confirmation...",
        });
      }
    } else if (isConfirmed) {
      setTxState('confirmed');
      if (faucetToastId) {
        notify.update(faucetToastId, {
          type: "success",
          title: "Faucet Claimed Successfully!",
          message: `Received ${wasFirstClaim ? '6,000' : '1,000'} PUFF tokens to your wallet!`,
        });
        setFaucetToastId('');
      } else {
        notify.success("Faucet Claimed Successfully!", `Received ${wasFirstClaim ? '6,000' : '1,000'} PUFF tokens!`);
      }
    } else if (writeError) {
      setTxState('error');
      // Format a user-friendly error message
      let msg = writeError.message || 'Transaction rejected or failed.';
      if (msg.includes('User rejected the request')) {
        msg = 'Transaction was rejected in your wallet.';
      } else if (msg.includes('cooldown active')) {
        msg = 'Faucet cooldown is currently active.';
      }
      setErrorMessage(msg);
      if (faucetToastId) {
        notify.update(faucetToastId, {
          type: "error",
          title: "Claim Failed",
          message: msg,
        });
        setFaucetToastId('');
      } else {
        notify.error("Claim Failed", msg);
      }
    } else {
      setTxState('idle');
    }
  }, [isWritePending, hash, isConfirming, isConfirmed, writeError]);

  // Refetch balances and claims on successful confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchBalance();
      refetchHasClaimedBonus();
      refetchLastFaucetClaim();
    }
  }, [isConfirmed, refetchBalance, refetchHasClaimedBonus, refetchLastFaucetClaim]);

  // Reset internal states on open or close
  const handleClose = () => {
    resetWrite();
    setTxState('idle');
    setErrorMessage('');
    onClose();
  };

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && txState !== 'signing' && txState !== 'pending') {
        handleClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, txState]);

  if (!isOpen || !mounted) return null;

  const handleClaim = () => {
    setErrorMessage('');
    writeContract({
      address: PUFF_TOKEN_ADDRESS as `0x${string}`,
      abi: PUFF_TOKEN_ABI as any,
      functionName: 'faucet',
    });
  };

  const formatCooldown = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    // Fallback to "23h 59m" format as requested, but with seconds shown when under a minute for interactive UI
    if (hrs === 0 && mins === 0) {
      return `Next claim in ${secs}s`;
    }
    return `Next claim in ${hrs}h ${mins}m`;
  };

  // Helper values
  const isCooldownActive = secondsLeft > 0;
  const isFirstTime = !hasClaimedBonus;
  const claimAmount = isFirstTime ? '6,000' : '1,000';

  return createPortal(
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto ${outfit.className}`}
      onClick={(e) => {
        if (e.target === e.currentTarget && txState !== 'signing' && txState !== 'pending') {
          handleClose();
        }
      }}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300"
        onClick={txState === 'signing' || txState === 'pending' ? undefined : handleClose}
      />

      {/* Modal Card */}
      <div 
        className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/80 p-8 shadow-2xl shadow-yellow-500/5 transition-all transform scale-100 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        {txState !== 'signing' && txState !== 'pending' && (
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800/40 transition-all cursor-pointer z-10"
            title="Close"
          >
            <IoClose size={20} />
          </button>
        )}

        {/* Content depending on TxState */}
        {txState === 'idle' && (
          <div className="text-center">
            {/* Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
              <span className="text-2xl font-bold">PUFF</span>
            </div>

            <h2 className={`${statliche.className} text-3xl tracking-wider text-yellow-400 mb-2`}>
              PUFF COIN FAUCET
            </h2>

            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Need PUFF coins to trade, bid, or list on the marketplace? Claim your daily allowance below.
            </p>

            {/* First Claim Bonus Banner */}
            {isFirstTime && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 via-amber-500/15 to-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-sm font-semibold flex items-center justify-center gap-2 animate-pulse">
                <span>🎁</span>
                <span>Includes a 5,000 PUFF New-User Bonus!</span>
              </div>
            )}

            {/* Action / State Button */}
            {isCooldownActive ? (
              <div className="w-full">
                <button
                  disabled
                  className="w-full py-3.5 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-bold text-base cursor-not-allowed transition-all"
                >
                  Cooldown Active
                </button>
                <p className="text-yellow-500/80 text-sm mt-3 font-semibold tracking-wide">
                  {formatCooldown(secondsLeft)}
                </p>
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 border border-yellow-400/20 cursor-pointer"
              >
                Claim {claimAmount} PUFF
              </button>
            )}
          </div>
        )}

        {txState === 'signing' && (
          <div className="text-center py-6">
            {/* Spinning Aura */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500/20 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-t-4 border-yellow-400 animate-spin" />
              <span className="text-xl">✍️</span>
            </div>

            <h3 className={`${statliche.className} text-2xl text-zinc-200 tracking-wider mb-2`}>
              AWAITING SIGNATURE
            </h3>
            <p className="text-zinc-400 text-sm px-4 leading-relaxed">
              Please sign the claim transaction in your connected wallet.
            </p>
          </div>
        )}

        {txState === 'pending' && (
          <div className="text-center py-6">
            {/* Pulse Loader */}
            <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-dashed border-yellow-500/40 animate-spin" />
              <span className="text-xl">⏳</span>
            </div>

            <h3 className={`${statliche.className} text-2xl text-zinc-200 tracking-wider mb-2`}>
              TRANSACTION PENDING
            </h3>
            <p className="text-zinc-400 text-sm px-4 mb-4 leading-relaxed">
              Waiting for blockchain confirmation... This will only take a moment.
            </p>
            {hash && (
              <span className="text-yellow-500/80 hover:text-yellow-400 text-xs font-semibold break-all block px-6">
                Tx Hash: {hash.slice(0, 8)}...{hash.slice(-8)}
              </span>
            )}
          </div>
        )}

        {txState === 'confirmed' && (
          <div className="text-center">
            {/* Success Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className={`${statliche.className} text-3xl tracking-wider text-emerald-400 mb-2`}>
              CLAIM SUCCESSFUL!
            </h2>

            <p className="text-zinc-300 text-sm mb-6 px-2 leading-relaxed">
              {wasFirstClaim 
                ? "Congratulations! You have received 6,000 PUFF (includes your 5,000 PUFF New-User Bonus)."
                : "You have successfully claimed 1,000 PUFF from the faucet."
              }
            </p>

            <button
              onClick={handleClose}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer"
            >
              Back to Marketplace
            </button>
          </div>
        )}

        {txState === 'error' && (
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className={`${statliche.className} text-3xl tracking-wider text-red-400 mb-2`}>
              CLAIM FAILED
            </h2>

            <p className="text-zinc-400 text-sm mb-6 px-4 leading-relaxed max-h-24 overflow-y-auto border border-zinc-900 rounded-lg p-2 bg-zinc-950">
              {errorMessage}
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 font-bold text-sm transition-all cursor-pointer border border-zinc-800"
              >
                Close
              </button>
              <button
                onClick={handleClaim}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-400 text-black font-bold text-sm transition-all cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

      </div>
    </div>,
    document.body
  );
}

