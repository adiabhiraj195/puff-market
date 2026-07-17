import React from 'react';
import { IoWalletOutline, IoCreateOutline } from "react-icons/io5";
import { UserProfile } from "@/api/user";

interface AccountHeaderProps {
  profile: UserProfile | null;
  account?: string | null;
  onEditClick: () => void;
}

export default function AccountHeader({
  profile,
  account,
  onEditClick
}: AccountHeaderProps) {
  return (
    <>
      {/* Profile Cover Banner */}
      <div className="h-44 w-full bg-gradient-to-r from-purple-950/40 via-zinc-900/60 to-blue-950/40 border border-zinc-800/80 rounded-2xl relative overflow-hidden mb-6 flex items-end p-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Overlap Header: Profile Info Row */}
      <div className="relative px-4 md:px-8 -mt-20 mb-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-6 border-b border-zinc-800/80">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
          {/* Avatar */}
          <div className="w-28 h-28 rounded-full border-4 border-[#060709] bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-3xl text-white font-extrabold shadow-2xl relative overflow-hidden group">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              profile?.username ? profile.username.slice(0, 2).toUpperCase() : (account ? account.slice(2, 4).toUpperCase() : "U")
            )}
          </div>

          {/* Name/Address */}
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 justify-center md:justify-start">
              {profile?.username || "Unnamed Collector"}
              {profile?.profileComplete ? (
                <span className="text-[10px] font-bold tracking-wider uppercase bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  Incomplete
                </span>
              )}
            </h1>
            <p className="text-zinc-500 text-xs font-mono mt-1.5 flex items-center gap-1.5 justify-center md:justify-start bg-zinc-900/40 border border-zinc-800/40 px-2.5 py-1 rounded-full w-fit">
              <IoWalletOutline className="text-purple-400" />
              {account ? `${account.slice(0, 8)}...${account.slice(-6)}` : ""}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onEditClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-bold text-sm transition-all active:scale-[0.98] shadow-md cursor-pointer"
        >
          <IoCreateOutline />
          {profile?.profileComplete ? "Edit Profile" : "Complete Profile"}
        </button>
      </div>
    </>
  );
}
