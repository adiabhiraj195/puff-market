import React from 'react';
import { 
  IoCreateOutline, 
  IoCloseOutline, 
  IoAlertCircleOutline, 
  IoCheckmarkCircleOutline, 
  IoImageOutline 
} from "react-icons/io5";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editUsername: string;
  setEditUsername: (val: string) => void;
  editDob: string;
  setEditDob: (val: string) => void;
  editBio: string;
  setEditBio: (val: string) => void;
  editAvatarUrl: string;
  setEditAvatarUrl: (val: string) => void;
  editError: string | null;
  saveSuccess: boolean;
  isSaving: boolean;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  onSubmit,
  editUsername,
  setEditUsername,
  editDob,
  setEditDob,
  editBio,
  setEditBio,
  editAvatarUrl,
  setEditAvatarUrl,
  editError,
  saveSuccess,
  isSaving
}: EditProfileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <IoCreateOutline className="text-indigo-400" />
            Edit Profile Details
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
          >
            <IoCloseOutline size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="flex-1 p-6 flex flex-col gap-4">
          {editError && (
            <div className="flex items-center gap-2 bg-red-950/20 border border-red-500/10 text-red-400 text-xs font-semibold p-3 rounded-xl">
              <IoAlertCircleOutline size={16} />
              <span>{editError}</span>
            </div>
          )}

          {saveSuccess && (
            <div className="flex items-center gap-2 bg-green-950/20 border border-green-500/10 text-green-400 text-xs font-semibold p-3 rounded-xl">
              <IoCheckmarkCircleOutline size={16} />
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-zinc-600 font-bold text-sm">@</span>
              <input
                type="text"
                placeholder="username"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-8 pr-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
              Min 3 characters. Only letters, numbers, hyphens, and underscores are allowed.
            </p>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Date of Birth
            </label>
            <input
              type="text"
              placeholder="e.g. October 12, 1998 or YYYY-MM-DD"
              value={editDob}
              onChange={(e) => setEditDob(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Bio
            </label>
            <textarea
              placeholder="Tell the community about yourself, your collection, or what you create..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
            />
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Avatar Image URL
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-3 text-zinc-500">
                <IoImageOutline size={16} />
              </div>
              <input
                type="url"
                placeholder="https://example.com/my-avatar.png"
                value={editAvatarUrl}
                onChange={(e) => setEditAvatarUrl(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-indigo-500 focus:outline-none rounded-xl pl-10 pr-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
              />
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Provide a URL to an externally hosted image (PNG, JPG) for your profile picture.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end border-t border-zinc-800/80 pt-5 mt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-sm transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || saveSuccess}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                "Save Details"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
