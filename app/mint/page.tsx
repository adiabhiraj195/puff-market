"use client";

import React, { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { decodeEventLog } from "viem";
import { useWallet } from "@/contexts/WalletProvider";
import { useNotification } from "@/contexts/NotificationContext";
import { PUFF_NFT_ADDRESS, PUFF_NFT_ABI } from "@/constants/PuffNft";
import { NFT_FACTORY_ADDRESS, NFT_FACTORY_ABI, MARKETPLACE_NFT_ABI } from "@/constants/NFTFactory";
import { useUserCollections, useRegisterCollection } from "@/hooks/useCollectionQueries";
import { useUploadIpfsMedia, useConfirmMint } from "@/hooks/useMediaQueries";

import DeployCollectionModal from "@/components/features/DeployCollectionModal";
import MintHeader from "@/components/features/MintHeader";
import MediaPreviewDropzone from "@/components/features/MediaPreviewDropzone";
import MintForm from "@/components/features/MintForm";
import MintBlockchainStep from "@/components/features/MintBlockchainStep";
import { IoWalletOutline } from "react-icons/io5";

interface Trait {
    key: string;
    value: string;
}

export default function MintPage() {
    const { isConnected, connectWallet, account } = useWallet();
    const { notify } = useNotification();

    // Query hooks
    const { data: collections = [] } = useUserCollections({
        enabled: isConnected && !!account,
    });
    const uploadIpfsMutation = useUploadIpfsMedia();
    const confirmMintMutation = useConfirmMint();
    const registerCollectionMutation = useRegisterCollection();

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

    // Custom Collection States
    const [selectedCollection, setSelectedCollection] = useState<string>(PUFF_NFT_ADDRESS);
    const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
    const [newCollName, setNewCollName] = useState("");
    const [newCollSymbol, setNewCollSymbol] = useState("");
    const [isDeployingCollection, setIsDeployingCollection] = useState(false);

    // Wagmi Minting States
    const [mintState, setMintState] = useState<"idle" | "signing" | "pending" | "confirmed" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    const { data: hash, error: writeError, isPending: isWritePending, writeContract, writeContractAsync, reset: resetWrite } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed, data: receipt } = useWaitForTransactionReceipt({ hash });
    const publicClient = usePublicClient();

    // Mount state for SSR hydration check
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

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
        if (!selectedFile) {
            notify.warning("File Required", "Please drop or browse a media file to upload.");
            return;
        }
        if (!name || !description) {
            notify.warning("Details Required", "NFT Name and Description are required.");
            return;
        }

        setUploadState("uploading");
        setErrorMessage("");
        const toastId = notify.loading("Uploading Media to IPFS...", "Pinning asset and metadata to IPFS storage.");

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

            const res = await uploadIpfsMutation.mutateAsync(formData);

            if (res.success) {
                setTokenURI(res.tokenURI);
                setIpfsMetadata(res.metadata);
                setUploadState("uploaded");
                notify.update(toastId, {
                    type: "success",
                    title: "IPFS Upload Complete! 🚀",
                    message: "Asset pinned successfully. Ready to mint on blockchain!",
                });
                setCurrentStep(2); // Proceed to Mint Blockchain Step
            } else {
                throw new Error(res.error || "Failed to upload");
            }
        } catch (err: any) {
            console.error(err);
            setUploadState("error");
            const errText = err.response?.data?.error || err.message || "IPFS upload failed.";
            setErrorMessage(errText);
            notify.update(toastId, {
                type: "error",
                title: "IPFS Upload Failed",
                message: errText,
            });
        }
    };

    // Step 2: Trigger blockchain contract write
    const handleMintNFT = () => {
        if (!account) {
            notify.warning("Wallet Required", "Please connect your Web3 wallet to mint.");
            return;
        }
        if (!tokenURI) {
            notify.warning("IPFS Upload Required", "Please complete IPFS upload step first.");
            return;
        }
        setErrorMessage("");
        setMintState("signing");
        notify.loading("Minting NFT on Blockchain...", "Please confirm the transaction in your wallet.");

        const isDefault = selectedCollection.toLowerCase() === PUFF_NFT_ADDRESS.toLowerCase();

        writeContract({
            address: selectedCollection as `0x${string}`,
            abi: (isDefault ? PUFF_NFT_ABI : MARKETPLACE_NFT_ABI) as any,
            functionName: isDefault ? "mintNFT" : "mint",
            args: isDefault
                ? [account as `0x${string}`, tokenURI]
                : [account as `0x${string}`],
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
            notify.error("Minting Failed", msg);
        }
    }, [isWritePending, hash, isConfirming, writeError, notify]);

    // Step 3: Handle receipt confirmation and post back to database
    useEffect(() => {
        if (isConfirmed && receipt) {
            setMintState("confirmed");
            notify.success("NFT Minted Successfully! 🎉", "Your NFT was created on-chain and registered.");
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

                    const confirmRes = await confirmMintMutation.mutateAsync({
                        tokenId: tokenIdStr || "0", // Fallback to 0 if decoding fails
                        metadataURI: tokenURI,
                        metadata: ipfsMetadata,
                        contractAddress: selectedCollection
                    });

                    if (confirmRes.success) {
                        const nftRecord = confirmRes.nft;
                        // Redirect to the detail page
                        window.location.href = `/nft/${nftRecord.id}`;
                    } else {
                        window.location.href = `/account`;
                    }
                } catch (err: any) {
                    console.error("Backend confirm mint failure:", err);
                    window.location.href = "/account";
                }
            };
            confirmOnBackend();
        }
    }, [isConfirmed, receipt, tokenURI, ipfsMetadata, selectedCollection, confirmMintMutation, notify]);

    const handleGoBack = () => {
        setUploadState("idle");
        setTokenURI("");
        setIpfsMetadata(null);
        resetWrite();
        setMintState("idle");
        setCurrentStep(1);
    };

    // Action to deploy custom proxy collections via factory
    const handleDeployCollection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCollName || !newCollSymbol) {
            notify.warning("Details Required", "Please enter collection name and symbol.");
            return;
        }
        if (!account) {
            notify.warning("Wallet Required", "Please connect your wallet first.");
            return;
        }

        setIsDeployingCollection(true);
        const toastId = notify.loading("Deploying Collection...", "Deploying custom ERC-721 proxy contract.");
        try {
            console.log("[Deploy Collection] Deploying custom collection contract...");
            const txHash = await writeContractAsync({
                address: NFT_FACTORY_ADDRESS as `0x${string}`,
                abi: NFT_FACTORY_ABI as any,
                functionName: "createCollection",
                args: [newCollName, newCollSymbol],
            });

            notify.update(toastId, {
                type: "loading",
                title: "Confirming Deployment...",
                message: "Waiting for collection deployment transaction receipt...",
            });

            if (publicClient) {
                const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
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
                    } catch (err) { }
                }

                if (!cloneAddress) {
                    throw new Error("CollectionCreated event not found in tx receipt.");
                }

                // Register collection in database via mutation
                const regRes = await registerCollectionMutation.mutateAsync({
                    contractAddress: cloneAddress,
                    name: newCollName,
                    symbol: newCollSymbol
                });

                if (regRes.success) {
                    notify.update(toastId, {
                        type: "success",
                        title: "Collection Deployed! 🎉",
                        message: `Collection "${newCollName}" (${newCollSymbol}) deployed successfully!`,
                    });
                    setSelectedCollection(cloneAddress);
                    setIsDeployModalOpen(false);
                    setNewCollName("");
                    setNewCollSymbol("");
                } else {
                    throw new Error(regRes.error || "Failed to register collection in database");
                }
            }
        } catch (err: any) {
            console.error("[Deploy Collection] Failed:", err);
            const errStr = err.shortMessage || err.message || "Failed to deploy collection.";
            notify.update(toastId, {
                type: "error",
                title: "Deployment Failed",
                message: errStr,
            });
        } finally {
            setIsDeployingCollection(false);
        }
    };

    if (!mounted) return null;

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-400 px-4 bg-[#060709]">
                <div className="w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 text-center shadow-2xl shadow-blue-500/5">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <IoWalletOutline size={30} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Connect Wallet</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        To upload content to IPFS storage and mint NFTs on the Ethereum blockchain, you must connect your Web3 wallet first.
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
        <div className="min-h-screen bg-[#060709] text-white px-4 md:px-8 py-8 selection:bg-blue-500/35">
            {/* Title Header */}
            <MintHeader />

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* LEFT PREVIEW PANEL */}
                <div className="lg:col-span-5">
                    <MediaPreviewDropzone
                        uploadState={uploadState}
                        previewUrl={previewUrl}
                        selectedFile={selectedFile}
                        isDragActive={isDragActive}
                        name={name}
                        description={description}
                        type={type}
                        tokenURI={tokenURI}
                        ipfsMetadata={ipfsMetadata}
                        handleDrag={handleDrag}
                        handleDrop={handleDrop}
                        handleFileBrowse={handleFileBrowse}
                    />
                </div>

                {/* RIGHT FORM CONTROL PANEL */}
                <div className="lg:col-span-7 bg-[#131419]/35 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col justify-between min-h-[500px]">
                    {currentStep === 1 ? (
                        /* STEP 1 FORM: IPFS Meta fields */
                        <MintForm
                            name={name}
                            setName={setName}
                            description={description}
                            setDescription={setDescription}
                            type={type}
                            setType={setType}
                            externalLink={externalLink}
                            setExternalLink={setExternalLink}
                            author={author}
                            setAuthor={setAuthor}
                            traits={traits}
                            handleAddTrait={handleAddTrait}
                            handleRemoveTrait={handleRemoveTrait}
                            handleTraitChange={handleTraitChange}
                            selectedCollection={selectedCollection}
                            setSelectedCollection={setSelectedCollection}
                            collections={collections}
                            onDeployClick={() => setIsDeployModalOpen(true)}
                            uploadState={uploadState}
                            selectedFile={selectedFile}
                            errorMessage={errorMessage}
                            onSubmit={handleUploadToIPFS}
                            defaultPuffNftAddress={PUFF_NFT_ADDRESS}
                        />
                    ) : (
                        /* STEP 2 FORM: Mint on Blockchain */
                        <MintBlockchainStep
                            mintState={mintState}
                            hash={hash}
                            errorMessage={errorMessage}
                            handleMintNFT={handleMintNFT}
                            handleGoBack={handleGoBack}
                        />
                    )}
                </div>
            </div>

            {/* DEPLOY NEW COLLECTION MODAL */}
            <DeployCollectionModal
                isOpen={isDeployModalOpen}
                onClose={() => setIsDeployModalOpen(false)}
                newCollName={newCollName}
                setNewCollName={setNewCollName}
                newCollSymbol={newCollSymbol}
                setNewCollSymbol={setNewCollSymbol}
                isDeploying={isDeployingCollection}
                onSubmit={handleDeployCollection}
            />
        </div>
    );
}
