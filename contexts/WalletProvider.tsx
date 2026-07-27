"use client"

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from "react";
import { ethers } from "ethers";
import { io } from "socket.io-client";
import { useAccount, useSignMessage, useDisconnect, useConnectorClient, useReadContract, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from "@/constants/PuffToken";
import { getSiweNonce, verifySiwe } from "@/api/auth";
import { useNotification } from "@/contexts/NotificationContext";

interface WalletContextType {
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    account: string | null;
    provider: ethers.BrowserProvider | null;
    signer: ethers.Signer | null;
    isConnected: boolean;
    isAuthenticated: boolean;
    puffBalance: string;
    error: string | null;
    user: any | null;
    refetchBalance: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { address, isConnected: isWalletConnected, status } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { data: client } = useConnectorClient();

    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [signer, setSigner] = useState<ethers.Signer | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string } | null>(null);
    const [isSigning, setIsSigning] = useState(false);

    const lastConnectionRef = useRef<{ address: string; chainId: number } | null>(null);
    const hasPromptedRef = useRef<string | null>(null);
    const checkedSepoliaRef = useRef<string | null>(null);

    const { notify } = useNotification();

    // Get PUFF Token balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: PUFF_TOKEN_ADDRESS as `0x${string}`,
        abi: PUFF_TOKEN_ABI as any,
        functionName: 'balanceOf',
        args: address ? [address as `0x${string}`] : undefined,
        query: {
            enabled: !!address,
        }
    });

    const puffBalance = balance
        ? parseFloat(ethers.formatUnits(balance as any, 18)).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
        : "0";

    // Fetch Sepolia ETH balance
    const { data: sepoliaBalance, isFetched: isSepoliaBalanceFetched } = useBalance({
        address: address as `0x${string}`,
        chainId: sepolia.id,
        query: {
            enabled: !!address && isWalletConnected,
        }
    });

    // Check Sepolia ETH balance when wallet connects
    useEffect(() => {
        if (!isWalletConnected || !address) {
            checkedSepoliaRef.current = null;
            return;
        }

        const walletAddr = address.toLowerCase();

        if (isSepoliaBalanceFetched && sepoliaBalance) {
            if (checkedSepoliaRef.current !== walletAddr) {
                checkedSepoliaRef.current = walletAddr;

                if (sepoliaBalance.value === 0n) {
                    notify.warning(
                        "No Sepolia ETH Detected",
                        "Your wallet has 0 Sepolia ETH. You will need Sepolia ETH for gas fees on the Sepolia network.",
                        12000,
                        {
                            label: "Get Sepolia ETH (Google Faucet)",
                            url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
                        }
                    );
                }
            }
        }
    }, [address, isWalletConnected, isSepoliaBalanceFetched, sepoliaBalance, notify]);

    // Setup ethers provider & signer from connector client
    useEffect(() => {
        if (!client) {
            if (lastConnectionRef.current !== null) {
                setProvider(null);
                setSigner(null);
                lastConnectionRef.current = null;
            }
            return;
        }

        const addressVal = client.account.address;
        const chainId = client.chain?.id ?? 0;

        if (
            lastConnectionRef.current &&
            lastConnectionRef.current.address.toLowerCase() === addressVal.toLowerCase() &&
            lastConnectionRef.current.chainId === chainId
        ) {
            // Avoid redundant provider/signer reconstruction to break re-render loop
            return;
        }

        try {
            const browserProvider = new ethers.BrowserProvider(client.transport);
            const rpcSigner = new ethers.JsonRpcSigner(browserProvider, client.account.address);
            setProvider(browserProvider);
            setSigner(rpcSigner);
            lastConnectionRef.current = { address: addressVal, chainId };
        } catch (err) {
            console.error("Failed to construct ethers provider/signer:", err);
        }
    }, [client]);

    // Keep state in sync with wagmi account state
    useEffect(() => {
        if (address) {
            setAccount(address);
            setIsConnected(isWalletConnected);
        } else {
            setAccount(null);
            setIsConnected(false);
        }
    }, [address, isWalletConnected]);

    // Initial mount: load JWT from localStorage
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        if (savedToken) {
            try {
                const payload = JSON.parse(atob(savedToken.split('.')[1]));
                if (payload.exp * 1000 > Date.now()) {
                    setToken(savedToken);
                    setUser({ id: payload.id, address: payload.address });
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem("token");
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            } catch (e) {
                localStorage.removeItem("token");
                document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            }
        }
    }, []);

    // SIWE Login trigger
    const siweLogin = async (walletAddress: string) => {
        if (isSigning) return;
        setIsSigning(true);
        let toastId = "";
        try {
            setError(null);
            toastId = notify.loading("Authenticating Wallet...", "Please sign the SIWE request in your wallet.");

            // 1. GET message string with nonce
            const { message } = await getSiweNonce(walletAddress);

            // 2. signMessage
            const signature = await signMessageAsync({ message });

            // 3. verify
            const verifyData = await verifySiwe(message, signature, walletAddress);

            if (verifyData.success) {
                localStorage.setItem('token', verifyData.token);
                document.cookie = `token=${verifyData.token}; path=/; max-age=2592000; SameSite=Lax`;
                setToken(verifyData.token);
                setUser(verifyData.user);
                setIsAuthenticated(true);
                notify.update(toastId, {
                    type: "success",
                    title: "Wallet Authenticated!",
                    message: "Successfully logged into Puffmarket.",
                });
            } else {
                throw new Error(verifyData.error || 'Authentication failed');
            }
        } catch (err: any) {
            console.error(err);
            const errMsg = err.message || "Failed to authenticate wallet";
            setError(errMsg);
            if (toastId) {
                notify.update(toastId, {
                    type: "error",
                    title: "Authentication Failed",
                    message: errMsg,
                });
            } else {
                notify.error("Authentication Failed", errMsg);
            }
            // Clear on failure
            localStorage.removeItem('token');
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setIsSigning(false);
        }
    };

    // Auto-login or verify address matches JWT
    useEffect(() => {
        // Wait until wagmi has finished checking the connection status
        if (status === 'connecting' || status === 'reconnecting') {
            return;
        }

        if (isWalletConnected && address) {
            const walletAddress = address.toLowerCase();
            let tokenAddress = "";

            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    tokenAddress = payload.address?.toLowerCase();
                } catch (e) { }
            }

            if (tokenAddress !== walletAddress && hasPromptedRef.current !== walletAddress) {
                hasPromptedRef.current = walletAddress;
                siweLogin(address);
            }
        } else if (status === 'disconnected') {
            hasPromptedRef.current = null;
            if (isAuthenticated) {
                disconnectWallet();
            }
        }
    }, [address, isWalletConnected, token, status, isAuthenticated]);

    // Socket.io real-time connection for notifications
    useEffect(() => {
        if (!isWalletConnected || !address) {
            return;
        }

        console.log("[Socket] Initializing socket connection to server...");
        const socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001");

        socket.on("connect", () => {
            const walletRoom = address.toLowerCase();
            console.log(`[Socket] Connected. Joining wallet room: ${walletRoom}`);
            socket.emit("join:wallet", { address: walletRoom });
        });

        socket.on("nft:sold", (data: { tokenId: string; price: string }) => {
            console.log("[Socket] Received nft:sold event:", data);
            const priceNum = Number(data.price);
            const proceeds = priceNum * 0.925;
            setNotification({
                message: `Your NFT (Token #${data.tokenId}) sold for ${priceNum.toLocaleString()} PUFF. Claim ${proceeds.toLocaleString()} PUFF.`
            });
            notify.success(
                "NFT Sold! 🎉",
                `Your NFT (Token #${data.tokenId}) sold for ${priceNum.toLocaleString()} PUFF. Claim ${proceeds.toLocaleString()} PUFF.`
            );

            // Auto refetch balance
            refetchBalance();
        });

        socket.on("disconnect", () => {
            console.log("[Socket] Disconnected from notification server.");
        });

        return () => {
            console.log("[Socket] Cleaning up socket connection...");
            socket.disconnect();
        };
    }, [address, isWalletConnected]);

    const connectWallet = async () => {
        try {
            if (isWalletConnected && address) {
                await siweLogin(address);
            } else if (openConnectModal) {
                await openConnectModal();
            }
        } catch (err) {
            console.error(err);
            setError("Failed to open connection modal or sign message");
        }
    };

    const disconnectWallet = () => {
        disconnect();
        localStorage.removeItem('token');
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setProvider(null);
        setSigner(null);
        setAccount(null);
        setIsConnected(false);
    };

    return (
        <WalletContext.Provider
            value={{
                connectWallet,
                disconnectWallet,
                account,
                provider,
                signer,
                isConnected: isWalletConnected && isAuthenticated,
                isAuthenticated,
                puffBalance,
                error,
                user,
                refetchBalance
            }}
        >
            {children}
            {notification && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full bg-[#111318] border border-green-500/30 rounded-2xl p-5 shadow-2xl text-white backdrop-blur-md animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 animate-ping" />
                            <span className="font-bold text-green-400 tracking-wide text-sm uppercase">NFT Sold! 🎉</span>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="text-gray-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed mt-2">{notification.message}</p>
                    <div className="mt-4 flex gap-2">
                        <button
                            onClick={() => setNotification(null)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 font-bold transition-all"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            )}
        </WalletContext.Provider>
    );
};