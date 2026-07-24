"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/contexts/WalletProvider";
import { useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { getUserNfts, getUserCollections, registerCollection } from "@/api/nft";
import { NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI } from "@/constants/NFTFactory";
import { getUserProfile, updateUserProfile, UserProfile } from "@/api/user";
import MoneyWithdraw from "@/components/features/MoneyWithdraw";
import Loading from "@/components/ui/Loading";
import AccountHeader from "@/components/features/AccountHeader";
import AccountProfileDetails from "@/components/features/AccountProfileDetails";
import AccountDashboard from "@/components/features/AccountDashboard";
import EditProfileModal from "@/components/features/EditProfileModal";
import DeployCollectionModal from "@/components/features/DeployCollectionModal";
import { IoWalletOutline } from "react-icons/io5";

export default function AccountPage() {
    const { isConnected, account, connectWallet } = useWallet();

    // Data states
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [nfts, setNfts] = useState<any[]>([]);
    const [collections, setCollections] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'nfts' | 'collections'>('nfts');
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

    // Custom Collection States
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [newCollName, setNewCollName] = useState("");
    const [newCollSymbol, setNewCollSymbol] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);

    const { writeContractAsync } = useWriteContract();
    const publicClient = usePublicClient();

    // Mount check
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchProfileAndNfts = async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileRes, nftsRes, collectionsRes] = await Promise.all([
                getUserProfile(),
                getUserNfts(),
                getUserCollections()
            ]);
            if (profileRes.success) {
                setProfile(profileRes.user);
                setEditUsername(profileRes.user.username || "");
                setEditBio(profileRes.user.bio || "");
                setEditDob(profileRes.user.dob || "");
                setEditAvatarUrl(profileRes.user.avatarUrl || "");
            }
            setNfts(nftsRes || []);
            setCollections(collectionsRes || []);
        } catch (e: any) {
            console.error("Failed to load user profile or NFTs:", e);
            setError("Failed to load account profile data.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeployCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollName || !newCollSymbol) return alert("Please enter name and symbol");
        if (!account) return alert("Wallet not connected");

        setIsDeploying(true);
        try {
            console.log("[Deploy Collection] Deploying custom collection contract...");
            const hash = await writeContractAsync({
                address: NFT_FACTORY_ADDRESS as `0x${string}`,
                abi: NFT_FACTORY_ABI as any,
                functionName: "createCollection",
                args: [newCollName, newCollSymbol],
            });

            console.log("[Deploy Collection] Tx Hash:", hash);
            if (publicClient) {
                const receipt = await publicClient.waitForTransactionReceipt({ hash });
                console.log("[Deploy Collection] Confirmed!", receipt);

                let cloneAddress = "";
                for (const log of receipt.logs) {
                    try {
                        const decoded = decodeEventLog({
                            abi: NFT_FACTORY_ABI,
                            data: log.data,
                            topics: log.topics,
                        });
                        if (decoded.eventName === "CollectionCreated") {
                            cloneAddress = (decoded.args as any)?.cloneAddress;
                            break;
                        }
                    } catch (err) {}
                }

                if (!cloneAddress) {
                    throw new Error("CollectionCreated event not found in tx receipt.");
                }

                // Register collection in backend
                const regRes = await registerCollection({
                    contractAddress: cloneAddress,
                    name: newCollName,
                    symbol: newCollSymbol
                });

                if (regRes.success) {
                    alert(`Collection "${newCollName}" deployed successfully!`);
                    setNewCollName("");
                    setNewCollSymbol("");
                    setIsDeployModalOpen(false);
                    // Refresh data
                    await fetchProfileAndNfts();
                } else {
                    throw new Error("Failed to register collection on backend.");
                }
            }
        } catch (err: any) {
            console.error("Deploy collection error:", err);
            alert(err.shortMessage || err.message || "Failed to deploy collection.");
        } finally {
            setIsDeploying(false);
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
                {/* Profile Cover Banner & Profile Info Row */}
                <AccountHeader
                    profile={profile}
                    account={account}
                    onEditClick={() => setIsEditModalOpen(true)}
                />

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COLUMN: Profile info details and withdraw balance */}
                    <div className="flex flex-col gap-6 lg:col-span-1">
                        <AccountProfileDetails profile={profile} />
                        <MoneyWithdraw />
                    </div>

                    {/* RIGHT COLUMN: NFT & Collection Dashboard */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <AccountDashboard
                            activeTab={activeTab}
                            setActiveTab={setActiveTab}
                            nfts={nfts}
                            collections={collections}
                            onDeployClick={() => setIsDeployModalOpen(true)}
                        />
                    </div>
                </div>
            </div>

            {/* EDIT PROFILE MODAL */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSubmit={handleSaveProfile}
                editUsername={editUsername}
                setEditUsername={setEditUsername}
                editDob={editDob}
                setEditDob={setEditDob}
                editBio={editBio}
                setEditBio={setEditBio}
                editAvatarUrl={editAvatarUrl}
                setEditAvatarUrl={setEditAvatarUrl}
                editError={editError}
                saveSuccess={saveSuccess}
                isSaving={isSaving}
            />

            {/* DEPLOY NEW COLLECTION MODAL */}
            <DeployCollectionModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                newCollName={newCollName}
                setNewCollName={setNewCollName}
                newCollSymbol={newCollSymbol}
                setNewCollSymbol={setNewCollSymbol}
                isDeploying={isDeploying}
                onSubmit={handleDeployCollection}
            />
        </div>
    );
}

