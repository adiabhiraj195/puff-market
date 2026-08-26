"use client";

import React, { useState, useEffect } from "react";
import { useWallet } from "@/providers/WalletProvider";
import { useNotification } from "@/providers/NotificationProvider";
import { useWriteContract, usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI } from "@/constants/NFTFactory";
import { useUserProfile, useUpdateProfile } from "@/hooks/useUserQueries";
import { useUserNfts } from "@/hooks/useNftQueries";
import { useUserCollections, useRegisterCollection } from "@/hooks/useCollectionQueries";
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
    const { notify } = useNotification();

    // Query hooks
    const { data: profileData, isLoading: isProfileLoading } = useUserProfile({
        enabled: isConnected && !!account,
    });
    const profile = profileData?.success ? profileData.user : null;

    const { data: nfts = [], isLoading: isNftsLoading } = useUserNfts(undefined, {
        enabled: isConnected && !!account,
    });

    const { data: collections = [], isLoading: isCollectionsLoading } = useUserCollections({
        enabled: isConnected && !!account,
    });

    const updateProfileMutation = useUpdateProfile();
    const registerCollectionMutation = useRegisterCollection();

    const [activeTab, setActiveTab] = useState<'nfts' | 'collections'>('nfts');
    const loading = isProfileLoading || isNftsLoading || isCollectionsLoading;

    // Edit modal states
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUsername, setEditUsername] = useState("");
    const [editBio, setEditBio] = useState("");
    const [editDob, setEditDob] = useState("");
    const [editAvatarUrl, setEditAvatarUrl] = useState("");
    const [editError, setEditError] = useState<string | null>(null);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Sync form inputs when profile changes
    useEffect(() => {
        if (profile) {
            setEditUsername(profile.username || "");
            setEditBio(profile.bio || "");
            setEditDob(profile.dob || "");
            setEditAvatarUrl(profile.avatarUrl || "");
        }
    }, [profile]);

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

                // Register collection in backend via mutation
                const regRes = await registerCollectionMutation.mutateAsync({
                    contractAddress: cloneAddress,
                    name: newCollName,
                    symbol: newCollSymbol
                });

                if (regRes.success) {
                    alert(`Collection "${newCollName}" deployed successfully!`);
                    setNewCollName("");
                    setNewCollSymbol("");
                    setIsDeployModalOpen(false);
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

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setEditError(null);
        setSaveSuccess(false);
        const toastId = notify.loading("Updating Profile...", "Saving profile details...");

        try {
            const payload = {
                username: editUsername.trim() || undefined,
                bio: editBio.trim() || undefined,
                dob: editDob.trim() || undefined,
                avatarUrl: editAvatarUrl.trim() || undefined
            };
            const res = await updateProfileMutation.mutateAsync(payload);
            if (res.success) {
                setSaveSuccess(true);
                notify.update(toastId, {
                    type: "success",
                    title: "Profile Updated!",
                    message: "Your profile information has been saved successfully.",
                });
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    setSaveSuccess(false);
                }, 1000);
            }
        } catch (err: any) {
            console.error("Error updating profile:", err);
            const errStr = err.response?.data?.error || err.message || "Failed to update profile.";
            setEditError(errStr);
            notify.update(toastId, {
                type: "error",
                title: "Update Failed",
                message: errStr,
            });
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
                isSaving={updateProfileMutation.isPending}
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

