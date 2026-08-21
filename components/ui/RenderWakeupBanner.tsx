"use client";

import React, { useState, useEffect } from "react";
import { FiServer, FiX, FiClock, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { Outfit } from "@/lib/fonts";
import { useServerHealth } from "@/hooks/useHealthQuery";

const outfit = Outfit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export default function RenderWakeupBanner() {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { data: serverOnline, isFetching: isChecking, refetch } = useServerHealth();

  useEffect(() => {
    // Show banner on landing if not dismissed in session
    const dismissed = sessionStorage.getItem("puff_render_banner_dismissed");
    if (!dismissed) {
      // Short delay for natural pop-in effect after initial render
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("puff_render_banner_dismissed", "true");
  };

  const checkServerStatus = async () => {
    await refetch();
  };

  if (!isVisible) return null;

  return (
    <div
      aria-label="Server status alert"
      className={`${outfit.className} fixed top-4 left-1/2 -translate-x-1/2 z-[9998] max-w-xl w-[92vw] sm:w-[540px] transition-all duration-500 ease-out transform translate-y-0 animate-in fade-in slide-in-from-top-6`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#121520]/95 border border-amber-500/50 shadow-[0_12px_40px_rgba(245,158,11,0.25)] backdrop-blur-2xl p-4 sm:p-5 text-white">
        {/* Glow accent pill */}
        <div className="absolute -top-12 -left-12 w-28 h-28 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

        <div className="flex items-start gap-3.5 relative z-10">
          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5 relative">
            <FiServer className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
          </div>

          <div className="flex-grow pr-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-amber-300 tracking-wide">
                Server Cold-Start Notice (Render Free Tier)
              </h3>
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center gap-1">
                <FiClock className="w-3 h-3" /> 30-90s Delay
              </span>
            </div>

            <p className="text-xs text-gray-200 mt-1.5 leading-relaxed">
              Our backend server is hosted on Render&apos;s free instance. If no request has been made recently, it spins down and may take <strong className="text-amber-200 font-semibold">30 to 90 seconds</strong> to wake up on the first request. Please wait patiently if data loading or actions take a moment!
            </p>

            <div className="mt-3 flex items-center justify-between gap-2 border-t border-amber-500/20 pt-2.5">
              <button
                onClick={checkServerStatus}
                disabled={isChecking}
                className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-all disabled:opacity-50"
              >
                <FiRefreshCw className={`w-3 h-3 ${isChecking ? "animate-spin" : ""}`} />
                {isChecking ? "Pinging Server..." : serverOnline === true ? "Server Ready!" : serverOnline === false ? "Server Waking Up..." : "Check Server Status"}
              </button>

              {serverOnline === true && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <FiCheckCircle className="w-3.5 h-3.5" /> Online
                </span>
              )}

              <button
                onClick={handleDismiss}
                className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500 text-black hover:bg-amber-400 transition-colors shadow-md cursor-pointer ml-auto"
              >
                Got It
              </button>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors shrink-0"
            aria-label="Close notification"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
