import React from 'react';
import { FiGrid, FiActivity, FiSearch } from "react-icons/fi";

interface CollectionTabsProps {
  activeTab: "items" | "activity";
  setActiveTab: (tab: "items" | "activity") => void;
  filteredNftsCount: number;
  historyCount: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: "all" | "listed" | "vaulted";
  setStatusFilter: (filter: "all" | "listed" | "vaulted") => void;
}

export default function CollectionTabs({
  activeTab,
  setActiveTab,
  filteredNftsCount,
  historyCount,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter
}: CollectionTabsProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6 z-10 relative">
      {/* Tabs */}
      <div className="flex bg-[#0c0d11]/80 border border-zinc-800/80 p-1.5 rounded-2xl shadow-xl backdrop-blur-sm">
        <button
          onClick={() => setActiveTab("items")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "items"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-800"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FiGrid size={13} /> Items ({filteredNftsCount})
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === "activity"
              ? "bg-zinc-800 text-white shadow-md border border-zinc-800"
              : "text-zinc-400 hover:text-white"
          }`}
        >
          <FiActivity size={13} /> Activity ({historyCount})
        </button>
      </div>

      {/* Filters (only visible in Items tab) */}
      {activeTab === "items" && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 md:flex-initial">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
              <FiSearch size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Token ID or Name..."
              className="w-full md:w-64 pl-10 pr-4 py-2.5 text-xs bg-zinc-950/80 border border-zinc-800/80 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/55 transition-all"
            />
          </div>

          {/* Status Filter Selector */}
          <div className="flex bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-1 font-bold text-[10px]">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                statusFilter === "all" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter("listed")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                statusFilter === "listed" ? "bg-indigo-600 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Listed
            </button>
            <button
              onClick={() => setStatusFilter("vaulted")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                statusFilter === "vaulted" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Vaulted
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
