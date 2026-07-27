"use client";

import React from "react";
import { useNotification, Toast, ToastType } from "@/contexts/NotificationContext";
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX, FiExternalLink } from "react-icons/fi";
import { CgSpinner } from "react-icons/cg";
import { Outfit } from "@/lib/fonts";

const outfit = Outfit({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case "success":
      return {
        bg: "bg-[#0b1b14]/95 border-emerald-500/40 shadow-[0_10px_30px_rgba(16,185,129,0.2)]",
        iconBg: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
        icon: <FiCheckCircle className="w-5 h-5 text-emerald-400" />,
        accent: "from-emerald-500 to-teal-400",
        titleColor: "text-emerald-300",
      };
    case "error":
      return {
        bg: "bg-[#1c0c11]/95 border-rose-500/40 shadow-[0_10px_30px_rgba(244,63,94,0.2)]",
        iconBg: "bg-rose-500/20 text-rose-400 border border-rose-500/30",
        icon: <FiAlertCircle className="w-5 h-5 text-rose-400" />,
        accent: "from-rose-500 to-red-500",
        titleColor: "text-rose-300",
      };
    case "warning":
      return {
        bg: "bg-[#1a150a]/95 border-amber-500/40 shadow-[0_10px_30px_rgba(245,158,11,0.2)]",
        iconBg: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
        icon: <FiAlertTriangle className="w-5 h-5 text-amber-400" />,
        accent: "from-amber-500 to-yellow-400",
        titleColor: "text-amber-300",
      };
    case "loading":
      return {
        bg: "bg-[#0f1424]/95 border-cyan-500/40 shadow-[0_10px_30px_rgba(6,182,212,0.2)]",
        iconBg: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
        icon: <CgSpinner className="w-5 h-5 text-cyan-400 animate-spin" />,
        accent: "from-cyan-500 to-blue-500",
        titleColor: "text-cyan-300",
      };
    case "info":
    default:
      return {
        bg: "bg-[#0d131f]/95 border-blue-500/40 shadow-[0_10px_30px_rgba(59,130,246,0.2)]",
        iconBg: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        icon: <FiInfo className="w-5 h-5 text-blue-400" />,
        accent: "from-blue-500 to-indigo-500",
        titleColor: "text-blue-300",
      };
  }
};

export default function ToastContainer() {
  const { toasts, notify } = useNotification();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className={`${outfit.className} fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-[calc(100vw-2.5rem)] sm:w-96 pointer-events-none`}
    >
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border backdrop-blur-xl p-4 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5 ${styles.bg}`}
          >
            {/* Top Accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${styles.accent}`} />

            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl shrink-0 ${styles.iconBg}`}>
                {styles.icon}
              </div>

              <div className="flex-grow pt-0.5 pr-2">
                <h4 className={`text-sm font-semibold tracking-wide ${styles.titleColor}`}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-xs text-gray-300 mt-1 leading-relaxed break-words">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <div className="mt-2.5">
                    {toast.action.url ? (
                      <a
                        href={toast.action.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          if (toast.action?.onClick) toast.action.onClick();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition-all cursor-pointer"
                      >
                        <span>{toast.action.label}</span>
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (toast.action?.onClick) toast.action.onClick();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
                      >
                        {toast.action.label}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => notify.dismiss(toast.id)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 shrink-0"
                aria-label="Dismiss toast"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
