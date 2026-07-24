import React from 'react';
import { IoBookOutline, IoCalendarOutline, IoPersonOutline } from "react-icons/io5";
import { UserProfile } from "@/api/user";

interface AccountProfileDetailsProps {
  profile: UserProfile | null;
}

export default function AccountProfileDetails({ profile }: AccountProfileDetailsProps) {
  return (
    <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
      <h3 className="text-sm font-bold text-zinc-400 tracking-wider uppercase border-b border-zinc-800/80 pb-2">
        Personal Details
      </h3>

      {/* Bio */}
      <div className="flex gap-3">
        <div className="text-zinc-500 mt-0.5">
          <IoBookOutline size={18} />
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">
            Bio
          </span>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
            {profile?.bio || "No biography added yet. Share some details about yourself and your collection!"}
          </p>
        </div>
      </div>

      {/* Date of Birth */}
      <div className="flex gap-3">
        <div className="text-zinc-500 mt-0.5">
          <IoCalendarOutline size={18} />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">
            Date of Birth
          </span>
          <p className="text-zinc-300 text-sm font-semibold">
            {profile?.dob || "Not specified"}
          </p>
        </div>
      </div>

      {/* Member Since */}
      <div className="flex gap-3">
        <div className="text-zinc-500 mt-0.5">
          <IoPersonOutline size={18} />
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase block mb-1">
            Member Since
          </span>
          <p className="text-zinc-400 text-xs font-semibold">
            {profile ? new Date(profile.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
}
