"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletProvider";
import { getUserNfts } from "@/api/nft";
import { getUserProfile, updateUserProfile, UserProfile } from "@/api/user";
import NFTCard from "@/components/ui/nft-card";
import WithdrawEth from "@/components/Money-withdraw";
import Link from "next/link";
import Loading from "@/components/ui/Loading";
import { 
    IoWalletOutline, 
    IoPersonOutline, 
    IoCalendarOutline, 
    IoBookOutline, 
    IoCreateOutline, 
    IoCloseOutline, 
    IoImageOutline, 
    IoGridOutline, 
    IoAlertCircleOutline,
    IoCheckmarkCircleOutline
} from "react-icons/io5";

export default function AccountPage() {
    const { isConnected, account, connectWallet } = useWallet();

    // Data states
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [nfts, setNfts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editDob, setEditDob] = useState("");
    const [editAvatarUrl, setEditAvatarUrl] = useState("");
    const [editError, setEditError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Mount check
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchProfileAndNfts = async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileRes, nftsRes] = await Promise.all([
                getUserProfile(),
                getUserNfts()
            ]);
            if (profileRes.success) {
                setProfile(profileRes.user);
                setEditUsername(profileRes.user.username || "");
                setEditBio(profileRes.user.bio || "");
                setEditDob(profileRes.user.dob || "");
                setEditAvatarUrl(profileRes.user.avatarUrl || "");
            }
            setNfts(nftsRes || []);
        } catch (e: any) {
            console.error("Failed to load user profile or NFTs:", e);
            setError("Failed to load account profile data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isConnected && account) {
            fetchProfileAndNfts();
        }
    }, [isConnected, account]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            const payload = {
                username: editUsername.trim() || undefined,
                bio: editBio.trim() || undefined,
                dob: editDob.trim() || undefined,
                avatarUrl: editAvatarUrl.trim() || undefined
            };
            const res = await updateUserProfile(payload);
            if (res.success) {
                setProfile(res.user);
                setSaveSuccess(true);
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setSaveSuccess(false);
                }, 1000);
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            setEditError(err.response?.data?.error || err.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#060709] text-white">
                <Loading />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[75vh] text-zinc-400 px-4 bg-[#060709]">
                <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xl shadow-blue-500/5">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <IoWalletOutline size={30} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Access Account</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Please connect your wallet and sign in with Ethereum to access your profile settings and view your NFT collection.
                    </p>
                    <button
                        onClick={connectWallet}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/10 border border-blue-400/20 cursor-pointer"
                    >
                        Connect Wallet & Sign In
                    </button>
                </div>
            </div>
        );
    }

    if (loading && !profile) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] bg-[#060709] text-white">
                <div className="text-center flex flex-col items-center gap-3">
                    <Loading />
                    <span className="text-sm text-zinc-400 tracking-wide animate-pulse">Loading profile and collection...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060709] text-white px-4 md:px-8 py-8">
            <div className="max-w-7xl mx-auto">
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
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-white font-bold text-sm transition-all active:scale-[0.98] shadow-md cursor-pointer"
                    >
                        <IoCreateOutline />
                        {profile?.profileComplete ? "Edit Profile" : "Complete Profile"}
                    </button>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Profile info details and withdraw balance */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        
                        {/* Profile Info Card */}
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

                        {/* Escrow Balance & Withdraw component */}
                        <WithdrawEth />
                    </div>

                    {/* RIGHT COLUMN: NFT Collection Grid */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-6 min-h-[450px] shadow-xl flex flex-col">
                            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6">
                                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                                    <IoGridOutline className="text-indigo-400" />
                                    My NFT Collection
                                </h3>
                                <span className="text-xs font-extrabold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full">
                                    {nfts.length} Items
                                </span>
                            </div>

                            {nfts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {nfts.map((item: any) => (
                                        <Link 
                                            href={`/nft/${item.id}`} 
                                            key={item.id} 
                                            className="transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/5 duration-200 block"
                                        >
                                            <div className="h-full">
                                                <NFTCard
                                                    tokenId={item.tokenId}
                                                    imageUrl={item.imageURI}
                                                    name={item.metadata?.name || item.name}
                                                    price={item.listing?.price}
                                                    paymentToken={item.listing?.paymentToken}
                                                />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                    <div className="w-16 h-16 rounded-full bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                                        <IoGridOutline size={26} />
                                    </div>
                                    <h4 className="text-white font-bold text-lg">No NFTs Owned Yet</h4>
                                    <p className="text-zinc-400 text-sm max-w-sm mt-1 mb-6 leading-relaxed">
                                        You haven&apos;t minted or purchased any NFTs on the platform yet. Click below to start creating!
                                    </p>
                                    <Link 
                                        href="/mint"
                                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-[0.98] cursor-pointer"
                                    >
                                        Mint Your First NFT
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col">
                        
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <IoCreateOutline className="text-indigo-400" />
                                Edit Profile Details
                            </h2>
                            <button
                                onClick={() => setIsEditModalOpen(false)}
                                className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer"
                            >
                                <IoCloseOutline size={22} />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSaveProfile} className="flex-1 p-6 flex flex-col gap-4">
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
                                    onClick={() => setIsEditModalOpen(false)}
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
            )}
        </div>
    );
}
