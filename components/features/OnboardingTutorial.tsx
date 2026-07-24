"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/contexts/WalletProvider";

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: "top" | "bottom" | "left" | "right" | "center";
}

export default function OnboardingTutorial() {
  const { isConnected, account } = useWallet();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const tourSteps: TourStep[] = [
    {
      selector: "body",
      title: "🚀 Welcome to the Interactive Tour!",
      description: "Let's take a quick 1-minute walk through the platform to show you around and help you get started.",
      position: "center",
    },
    {
      selector: "#tour-mint-nft",
      title: "🎨 Mint NFT",
      description: "Here you can upload your files to IPFS and mint new NFTs. Your metadata gets permanently anchored on the blockchain.",
      position: "bottom",
    },
    {
      selector: "#tour-collections",
      title: "📂 Collections",
      description: "Browse collections by contract, showing metadata statistics, floor prices, symbols, and floor levels.",
      position: "bottom",
    },
    {
      selector: "#tour-auctions",
      title: "⏳ Auctions",
      description: "Participate in real-time English auctions. Place bids or create your own auctions with customized starting prices.",
      position: "bottom",
    },
    {
      selector: "#tour-search-bar",
      title: "🔍 Smart Search",
      description: "Quickly look up specific items, creators, collections, or token IDs using our indexing search system.",
      position: "bottom",
    },
    {
      selector: "#tour-wallet-status",
      title: "💰 Faucet & Wallet Status",
      description: "View your active address and PUFF token balance. If your balance is low, click 'Get PUFF' to get free test tokens instantly!",
      position: "bottom",
    },
    {
      selector: "#tour-profile",
      title: "👤 User Profile Page",
      description: "Click here to see your profile, your collection, active listings, bids, and personal transaction history.",
      position: "bottom",
    },
    {
      selector: "#tour-market-stats",
      title: "📊 Live Market Analytics",
      description: "Track the platform's health at a glance with real-time floor price, trading volume, and listing counts.",
      position: "bottom",
    },
    {
      selector: "#tour-featured-drops",
      title: "⭐ Featured NFT Drops",
      description: "Discover curated collections, featured items, and trending categories on our interactive display.",
      position: "top",
    },
    {
      selector: "#tour-listing-filters",
      title: "⚙️ Category & Sorting Filters",
      description: "Sort items by price or date, filter by categories like Art, Music, or Gaming, and toggle between grid or list views.",
      position: "top",
    },
    {
      selector: "body",
      title: "✨ You are ready to trade!",
      description: "Congratulations! You've completed the walkthrough. Feel free to explore the marketplace, mint assets, and place bids.",
      position: "center",
    },
  ];

  // Prevent Next.js hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect when user logs in/connects wallet
  useEffect(() => {
    if (!mounted || !isConnected || !account) {
      setIsWelcomeOpen(false);
      setTourActive(false);
      return;
    }

    const completed = localStorage.getItem(`puff_onboarded_${account.toLowerCase()}`);
    if (completed !== "true") {
      // Trigger onboarding modal
      setIsWelcomeOpen(true);
    }
  }, [mounted, isConnected, account]);

  // Listen for manual trigger event (e.g. from Guide button in Navbar)
  useEffect(() => {
    const handleManualTrigger = () => {
      setIsWelcomeOpen(true);
    };
    window.addEventListener("start_puff_tutorial", handleManualTrigger);
    return () => window.removeEventListener("start_puff_tutorial", handleManualTrigger);
  }, []);

  // Calculate target element coordinates and handle auto-scroll
  useEffect(() => {
    if (!tourActive || !mounted) {
      setHighlightRect(null);
      return;
    }

    const step = tourSteps[currentStep];
    if (!step) return;

    if (step.selector === "body") {
      setHighlightRect(null);
      return;
    }

    const updatePosition = () => {
      const element = document.querySelector(step.selector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setHighlightRect({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
      } else {
        setHighlightRect(null);
      }
    };

    // Auto-scroll target into view
    const element = document.querySelector(step.selector);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Wait for smooth scroll completion before calculating coordinates
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(updatePosition, 350);
    } else {
      updatePosition();
    }

    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [tourActive, currentStep, mounted]);

  if (!mounted) return null;

  const handleSkipWelcome = () => {
    if (account) {
      localStorage.setItem(`puff_onboarded_${account.toLowerCase()}`, "true");
    }
    setIsWelcomeOpen(false);
  };

  const handleStartTour = () => {
    setIsWelcomeOpen(false);
    // Ensure user is on home page for homepage tour elements
    if (window.location.pathname !== "/") {
      router.push("/");
      // Wait a moment for transition
      setTimeout(() => {
        setTourActive(true);
        setCurrentStep(0);
      }, 500);
    } else {
      setTourActive(true);
      setCurrentStep(0);
    }
  };

  const handleNextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleCompleteTour();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCompleteTour = () => {
    if (account) {
      localStorage.setItem(`puff_onboarded_${account.toLowerCase()}`, "true");
    }
    setTourActive(false);
  };

  // Determine tooltip style
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlightRect || currentStep >= tourSteps.length) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100,
      };
    }

    const step = tourSteps[currentStep];
    const margin = 16;
    const isMobile = window.innerWidth < 768;

    if (isMobile && step.position !== "center") {
      return {
        position: "fixed",
        bottom: 24,
        left: 16,
        right: 16,
        width: "calc(100% - 32px)",
        zIndex: 100,
      };
    }

    switch (step.position) {
      case "bottom":
        return {
          position: "absolute",
          top: highlightRect.top + highlightRect.height + margin,
          left: highlightRect.left + highlightRect.width / 2,
          transform: "translateX(-50%)",
          zIndex: 100,
        };
      case "top":
        return {
          position: "absolute",
          top: highlightRect.top - margin,
          left: highlightRect.left + highlightRect.width / 2,
          transform: "translate(-50%, -100%)",
          zIndex: 100,
        };
      case "left":
        return {
          position: "absolute",
          top: highlightRect.top + highlightRect.height / 2,
          left: highlightRect.left - margin,
          transform: "translate(-100%, -50%)",
          zIndex: 100,
        };
      case "right":
        return {
          position: "absolute",
          top: highlightRect.top + highlightRect.height / 2,
          left: highlightRect.left + highlightRect.width + margin,
          transform: "translateY(-50%)",
          zIndex: 100,
        };
      default:
        return {
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 100,
        };
    }
  };

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Floating Tutorial / Guide Button in Bottom-Right Corner */}
      {!isWelcomeOpen && !tourActive && (
        <button
          onClick={() => setIsWelcomeOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-white font-bold text-xs shadow-2xl shadow-black/80 backdrop-blur-xl transition-all duration-300 hover:scale-105 active:scale-95 group cursor-pointer"
          title="Open Platform Guide & Tutorial"
          id="tour-guide-button"
        >
          <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-extrabold tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent">
            Guide & Tour
          </span>
        </button>
      )}
      {/* 1. Welcome Introduction Popup */}
      {isWelcomeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-[#0b0c10]/95 border border-zinc-800/80 shadow-[0_0_50px_rgba(30,58,138,0.2)] text-white p-6 sm:p-10 transition-all duration-300">
            {/* Ambient Background Lights */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-blue-600/10 rounded-full blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none" />

            {/* Header */}
            <div className="text-center relative z-10 space-y-2">
              <span className="px-3 py-1 text-[10px] font-black tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full uppercase">
                New Wallet Connected
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Welcome to PUFF Market
              </h2>
              <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                Discover the next generation of decentralized NFT trading backed by cryptographic verification.
              </p>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 relative z-10">
              {/* Left Column: Proof of Data on Blockchain */}
              <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-5 space-y-3 hover:border-zinc-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-zinc-100">Proof of Data</h3>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every asset is secured using an immutable cryptographic blueprint. Files are uploaded to decentralized storage (IPFS), generating a unique content identifier hash. 
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This hash is permanently anchored inside the smart contract on the blockchain. Any user can mathematically verify that the image or metadata matches what is on-chain, proving authenticity and lineage.
                </p>
              </div>

              {/* Right Column: Capabilities */}
              <div className="bg-zinc-950/40 border border-zinc-800/40 rounded-2xl p-5 space-y-3 hover:border-zinc-700/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-base text-zinc-100">Capabilities</h3>
                </div>
                <ul className="text-xs text-zinc-400 space-y-2 leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Minting:</strong> Directly turn files into blockchain verified assets.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Trading:</strong> Instantly list and purchase NFTs with PUFF tokens.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Auctions:</strong> Bid on ongoing English auctions or list your own timed bidding events.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-purple-400 font-bold">✓</span>
                    <span><strong>Faucet:</strong> Request free PUFF test tokens directly inside the interface.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 relative z-10">
              <button
                onClick={handleSkipWelcome}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-900 font-bold transition-all text-sm cursor-pointer"
              >
                Skip & Explore
              </button>
              <button
                onClick={handleStartTour}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-500 hover:to-indigo-600 text-white font-extrabold text-sm transition-all shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
              >
                Start Guided Tour
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Interactive Tour Overlay */}
      {tourActive && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* SVG Dimming Mask Cutout */}
          <svg className="absolute inset-0 w-full h-full pointer-events-auto">
            <defs>
              <mask id="tour-cutout-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {highlightRect && (
                  <rect
                    x={highlightRect.left - 8}
                    y={highlightRect.top - 8 - window.scrollY}
                    width={highlightRect.width + 16}
                    height={highlightRect.height + 16}
                    rx="12"
                    ry="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="black"
              opacity="0.75"
              mask="url(#tour-cutout-mask)"
            />
          </svg>

          {/* Animated Glow Border around Highlight */}
          {highlightRect && (
            <div
              style={{
                position: "absolute",
                top: highlightRect.top - 8,
                left: highlightRect.left - 8,
                width: highlightRect.width + 16,
                height: highlightRect.height + 16,
              }}
              className="border-2 border-blue-500 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse pointer-events-none transition-all duration-300 z-50"
            />
          )}

          {/* Tour Interactive Tooltip Card */}
          <div
            style={getTooltipStyle()}
            className="w-[320px] sm:w-[360px] bg-[#0c0d11]/95 border border-zinc-800/90 rounded-2xl p-5 shadow-2xl backdrop-blur-md pointer-events-auto transition-all duration-300 animate-in zoom-in-95 duration-200"
          >
            {/* Step Counter */}
            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>PUFF MARKET TOUR</span>
              <span>
                {currentStep + 1} / {tourSteps.length}
              </span>
            </div>

            {/* Step Title & Description */}
            <div className="mt-3 space-y-1">
              <h4 className="font-extrabold text-base text-white">{step?.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{step?.description}</p>
            </div>

            {/* Step Navigation Controls */}
            <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-900">
              <button
                onClick={handleCompleteTour}
                className="text-[10px] uppercase font-black text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              >
                Skip
              </button>

              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrevStep}
                    className="flex items-center justify-center p-1.5 px-3 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={handleNextStep}
                  className="flex items-center justify-center p-1.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-blue-600/10"
                >
                  {currentStep === tourSteps.length - 1 ? "Finish" : "Next"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
