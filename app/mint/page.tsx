"use client";

import React, { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { decodeEventLog } from "viem";
import { useWallet } from "@/contexts/WalletProvider";
import axiosClient from "@/api/axiosClient";
import { PUFF_NFT_ADDRESS, PUFF_NFT_ABI } from "@/constants/PuffNft";
import Loading from "@/components/ui/Loading";
import FlottingBackButton from "@/components/ui/floting-back-button";
import { IoCloudUploadOutline, IoAdd, IoTrashOutline } from "react-icons/io5";

interface Trait {
    key: string;
    value: string;
}

export default function MintPage() {
    const { isConnected, connectWallet, account } = useWallet();

    // Form inputs
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState("other");
    const [externalLink, setExternalLink] = useState("");
    const [author, setAuthor] = useState("");
    const [traits, setTraits] = useState<Trait[]>([{ key: "", value: "" }]);

    // File Drag & Drop
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    // IPFS Uploading States
    const [uploadState, setUploadState] = useState<"idle" | "uploading" | "uploaded" | "error">("idle");
    const [tokenURI, setTokenURI] = useState("");
    const [ipfsMetadata, setIpfsMetadata] = useState<any>(null);

    // Wagmi Minting States
    const [mintState, setMintState] = useState<"idle" | "signing" | "pending" | "confirmed" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const { data: hash, error: writeError, isPending: isWritePending, writeContract, reset: resetWrite } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash });

    // Handle Drag & Drop Events
    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    };

    const handleFileBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            processFile(file);
        }
    };

    const processFile = (file: File) => {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    // Dynamic traits management
    const handleAddTrait = () => {
        setTraits([...traits, { key: "", value: "" }]);
    };

    const handleRemoveTrait = (index: number) => {
        setTraits(traits.filter((_, i) => i !== index));
    };

    const handleTraitChange = (index: number, field: "key" | "value", value: string) => {
        const newTraits = traits.map((trait, i) => {
            if (i === index) {
                return { ...trait, [field]: value };
            }
            return trait;
        });
        setTraits(newTraits);
    };

    // Step 1: Upload media & metadata to IPFS via Backend Server
    const handleUploadToIPFS = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return alert("Please drop or browse a media file.");
        if (!name || !description) return alert("Name and description are required.");

        setUploadState("uploading");
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("name", name);
            formData.append("description", description);
            formData.append("type", type);
            formData.append("externalLink", externalLink);
            formData.append("author", author || account || "Anonymous");
            // Filter out incomplete traits
            const validTraits = traits.filter((t) => t.key.trim() && t.value.trim());
            formData.append("traits", JSON.stringify(validTraits));

            const res = await axiosClient.post("/api/media/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (res.data.success) {
                setTokenURI(res.data.tokenURI);
                setIpfsMetadata(res.data.metadata);
                setUploadState("uploaded");
            } else {
                throw new Error(res.data.error || "Failed to upload");
            }
        } catch (err: any) {
            console.error(err);
            setUploadState("error");
            setErrorMessage(err.response?.data?.error || err.message || "IPFS upload failed.");
        }
    };

    // Step 2: Trigger blockchain contract write
    const handleMintNFT = () => {
        if (!account) return alert("Please reconnect your wallet.");
        if (!tokenURI) return alert("IPFS upload is not complete.");
        // console.log(account, tokenURI, " consoled value")
        setErrorMessage("");
        setMintState("signing");

        writeContract({
            address: PUFF_NFT_ADDRESS as `0x${string}`,
            abi: PUFF_NFT_ABI as any,
            functionName: "mintNFT",
            args: [account as `0x${string}`, tokenURI],
            gas: 500000n
        });
    };

    // Track signature & contract pending status
    useEffect(() => {
        if (isWritePending) {
            setMintState("signing");
        } else if (hash && isConfirming) {
            setMintState("pending");
        } else if (writeError) {
            setMintState("error");
            let msg = writeError.message || "Transaction rejected or failed.";
            if (msg.includes("User rejected")) {
                msg = "Transaction was rejected in your wallet.";
            }
            setErrorMessage(msg);
        }
    }, [isWritePending, hash, isConfirming, writeError]);

    // Step 3: Handle receipt confirmation and post back to database
    useEffect(() => {
        if (isConfirmed && receipt) {
            setMintState("confirmed");
            const confirmOnBackend = async () => {
                try {
                    let tokenIdStr = "";
                    // Decode logs to extract tokenId from Transfer event
                    try {
                        const transferLog = receipt.logs.find((log) => {
                            try {
                                const decoded = decodeEventLog({
                                    abi: PUFF_NFT_ABI,
                                    data: log.data,
                                    topics: log.topics,
                                });
                                return decoded.eventName === "Transfer";
                            } catch {
                                return false;
                            }
                        });

                        if (transferLog) {
                            const decoded = decodeEventLog({
                                abi: PUFF_NFT_ABI,
                                data: transferLog.data,
                                topics: transferLog.topics,
                            });
                            tokenIdStr = (decoded.args as any)?.tokenId?.toString() || "";
                        }
                    } catch (err) {
                        console.error("Error decoding tokenId from receipt logs:", err);
                    }

                    console.log("[Mint] Confirming on-chain mint on backend, tokenId:", tokenIdStr);

                    const confirmRes = await axiosClient.post("/api/media/confirm-mint", {
                        tokenId: tokenIdStr || "0", // Fallback to 0 if decoding fails
                        metadataURI: tokenURI,
                        metadata: ipfsMetadata,
                    });

                    if (confirmRes.data.success) {
                        const nftRecord = confirmRes.data.nft;
                        // Redirect to the detail page (resolved via UUID or TokenId)
                        window.location.href = `/nft/${tokenIdStr || nftRecord.id}`;
                    } else {
                        window.location.href = `/nft/${tokenIdStr || "0"}`;
                    }
                } catch (err: any) {
                    console.error("Backend confirm mint failure:", err);
                    // Fallback to home/account on severe error
                    window.location.href = "/account";
                }
            };
            confirmOnBackend();
        }
    }, [isConfirmed, receipt, tokenURI, ipfsMetadata]);

    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    // SIWE Check
    if (!mounted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
                <Loading />
            </div>
        );
    }

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-zinc-400 px-4 bg-zinc-950">
                <FlottingBackButton />
                <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xl shadow-blue-500/5">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <span className="text-3xl">🔑</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Mint Workspace</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        Connect your wallet and sign in with Ethereum to unlock the NFT creator studio and upload assets to IPFS.
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

    return (
        <div className="min-h-screen bg-zinc-950 text-white px-8 py-10 relative">
            <FlottingBackButton />

            {/* Title Header */}
            <div className="max-w-6xl mx-auto mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                    Mint New NFT 💦
                </h1>
                <p className="text-zinc-400 text-sm mt-2">
                    Upload your digital creation to decentralized IPFS storage, fill details, and mint it directly onto the blockchain.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* LEFT COLUMN: Media Preview & Dropzone */}
                <div className="flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-zinc-200">Media Preview</h3>

                    {uploadState !== "uploaded" ? (
                        /* Input Dropzone */
                        <div
                            onDragEnter={handleDrag}
                            onDragOver={handleDrag}
                            onDragLeave={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[400px] p-6 transition-all duration-200 bg-zinc-900/30 ${isDragActive
                                ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5"
                                : "border-zinc-800 hover:border-zinc-700"
                                } relative overflow-hidden group`}
                        >
                            {previewUrl ? (
                                <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-950">
                                    {selectedFile?.type.startsWith("video/") ? (
                                        <video src={previewUrl} controls className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                    )}
                                    <label
                                        htmlFor="replace-file"
                                        className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full border border-zinc-800 cursor-pointer backdrop-blur-sm transition-all"
                                    >
                                        Change File
                                    </label>
                                    <input
                                        type="file"
                                        id="replace-file"
                                        className="hidden"
                                        onChange={handleFileBrowse}
                                        accept="image/*,video/*"
                                    />
                                </div>
                            ) : (
                                <div className="text-center flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:text-zinc-200 transition-all shadow-md">
                                        <IoCloudUploadOutline size={28} />
                                    </div>
                                    <div>
                                        <label htmlFor="file-input" className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline underline-offset-2">
                                            Click to upload
                                        </label>
                                        <span className="text-zinc-500"> or drag and drop</span>
                                    </div>
                                    <div className="text-xs text-zinc-500 flex flex-col gap-1">
                                        <span>Supports images (PNG, JPG, GIF, SVG) or videos (MP4)</span>
                                        <span>Max size: 50MB</span>
                                    </div>
                                    <input
                                        type="file"
                                        id="file-input"
                                        className="hidden"
                                        onChange={handleFileBrowse}
                                        accept="image/*,video/*"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Uploaded / Ready-to-Mint NFT Preview Card */
                        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
                            <div className="w-full h-80 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-900">
                                {selectedFile?.type.startsWith("video/") ? (
                                    <video src={previewUrl!} controls className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <img src={previewUrl!} alt="NFT Preview" className="max-w-full max-h-full object-contain" />
                                )}
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                                    {type}
                                </span>
                                <h2 className="text-2xl font-extrabold mt-3">{name}</h2>
                                <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{description}</p>
                            </div>

                            {/* Show IPFS Links */}
                            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-xs font-mono text-zinc-400 flex flex-col gap-2">
                                <div className="flex justify-between items-center gap-4">
                                    <span className="font-bold text-zinc-500">Metadata URL:</span>
                                    <a href={tokenURI} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                                        {tokenURI}
                                    </a>
                                </div>
                                <div className="flex justify-between items-center gap-4">
                                    <span className="font-bold text-zinc-500">Media URL:</span>
                                    <a href={ipfsMetadata?.image} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                                        {ipfsMetadata?.image}
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Form & Mint Actions */}
                <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/60 rounded-2xl p-8 flex flex-col justify-between">

                    {uploadState !== "uploaded" ? (
                        /* STEP 1 FORM: Upload to IPFS */
                        <form onSubmit={handleUploadToIPFS} className="flex flex-col gap-5">
                            <h3 className="text-lg font-bold text-zinc-200 border-b border-zinc-800 pb-3">NFT Details</h3>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-1.5">Asset Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter your NFT name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-1.5">Description *</label>
                                <textarea
                                    placeholder="Describe your asset (supports markdown)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                                    required
                                />
                            </div>

                            {/* Category Type */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-2">Category type</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {["art", "gaming", "membership", "pfps", "photography", "music", "other"].map((cat) => (
                                        <button
                                            type="button"
                                            key={cat}
                                            onClick={() => setType(cat)}
                                            className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border capitalize transition-all ${type === cat
                                                ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10"
                                                : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Creator / Author */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-1.5">Original Creator</label>
                                <input
                                    type="text"
                                    placeholder="Creator name or pseudonym"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            {/* External Link */}
                            <div>
                                <label className="block text-sm font-bold text-zinc-300 mb-1.5">External Link</label>
                                <input
                                    type="url"
                                    placeholder="https://yourwebsite.com"
                                    value={externalLink}
                                    onChange={(e) => setExternalLink(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-all text-sm"
                                />
                            </div>

                            {/* Traits / Attributes Section */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-sm font-bold text-zinc-300">Attribute Traits</label>
                                    <button
                                        type="button"
                                        onClick={handleAddTrait}
                                        className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                                    >
                                        <IoAdd /> Add Trait
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
                                    {traits.map((trait, index) => (
                                        <div key={index} className="flex gap-2 items-center">
                                            <input
                                                type="text"
                                                placeholder="Trait type (e.g. Color)"
                                                value={trait.key}
                                                onChange={(e) => handleTraitChange(index, "key", e.target.value)}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Value (e.g. Blue)"
                                                value={trait.value}
                                                onChange={(e) => handleTraitChange(index, "value", e.target.value)}
                                                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTrait(index)}
                                                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
                                            >
                                                <IoTrashOutline size={15} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Area */}
                            <div className="border-t border-zinc-800/80 pt-6 mt-4">
                                {uploadState === "uploading" ? (
                                    <div className="w-full flex flex-col items-center justify-center gap-2 py-2">
                                        <Loading />
                                        <span className="text-xs text-zinc-400 animate-pulse">Uploading file + generating thumbnail + pinning to IPFS...</span>
                                    </div>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={!selectedFile || !name || !description}
                                        className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Upload to IPFS
                                    </button>
                                )}
                                {errorMessage && (
                                    <p className="text-red-400 text-xs mt-3 text-center font-semibold bg-red-950/20 border border-red-500/10 rounded-lg p-2.5">
                                        {errorMessage}
                                    </p>
                                )}
                            </div>
                        </form>
                    ) : (
                        /* STEP 2 FORM: Mint on Blockchain */
                        <div className="flex flex-col h-full justify-between gap-10">
                            <div className="flex flex-col gap-6">
                                <h3 className="text-lg font-bold text-zinc-200 border-b border-zinc-800 pb-3 flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                    IPFS Upload Complete
                                </h3>

                                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-900">
                                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                                        Your media files and metadata JSON have been successfully compiled and uploaded to the decentralized IPFS network.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
                                        <span>✅</span> Ready to mint on-chain
                                    </div>
                                </div>

                                {/* Step states */}
                                {mintState !== "idle" && (
                                    <div className="flex flex-col gap-4 border border-zinc-800 bg-zinc-900/60 p-5 rounded-2xl text-center">
                                        {mintState === "signing" && (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="relative flex h-14 w-14 items-center justify-center">
                                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-pulse" />
                                                    <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin" />
                                                    <span className="text-lg">✍️</span>
                                                </div>
                                                <h4 className="font-bold text-white text-base">Awaiting Signature</h4>
                                                <p className="text-zinc-400 text-xs">Please confirm the mint transaction in your connected wallet.</p>
                                            </div>
                                        )}

                                        {mintState === "pending" && (
                                            <div className="flex flex-col items-center gap-3">
                                                <div className="relative flex h-14 w-14 items-center justify-center">
                                                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-blue-500/40 animate-spin" />
                                                    <span className="text-lg">⏳</span>
                                                </div>
                                                <h4 className="font-bold text-white text-base">Transaction Pending</h4>
                                                <p className="text-zinc-400 text-xs">Waiting for blockchain confirmation... This will only take a moment.</p>
                                                {hash && (
                                                    <a
                                                        href={`http://localhost:3000`} // Mock chain explorer link or dummy link
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-400 hover:text-blue-300 text-xs font-mono break-all font-semibold bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg mt-2"
                                                    >
                                                        Tx Hash: {hash.slice(0, 10)}...{hash.slice(-10)}
                                                    </a>
                                                )}
                                            </div>
                                        )}

                                        {mintState === "confirmed" && (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-bold text-emerald-400 text-base">Mint Successful!</h4>
                                                <p className="text-zinc-400 text-xs animate-pulse">Syncing record in database & loading NFT details...</p>
                                            </div>
                                        )}

                                        {mintState === "error" && (
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </div>
                                                <h4 className="font-bold text-red-400 text-base">Mint Failed</h4>
                                                <p className="text-zinc-400 text-xs leading-relaxed max-w-xs">{errorMessage}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-zinc-800/80 pt-6 flex flex-col gap-3">
                                <button
                                    onClick={handleMintNFT}
                                    disabled={mintState === "signing" || mintState === "pending" || mintState === "confirmed"}
                                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-extrabold text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/10 border border-blue-400/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Mint NFT
                                </button>

                                {mintState !== "signing" && mintState !== "pending" && mintState !== "confirmed" && (
                                    <button
                                        onClick={() => {
                                            setUploadState("idle");
                                            setTokenURI("");
                                            setIpfsMetadata(null);
                                            resetWrite();
                                            setMintState("idle");
                                        }}
                                        className="w-full py-3 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-300 font-bold text-sm transition-all cursor-pointer"
                                    >
                                        Go Back & Edit
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
