"use client";

import React, { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { ethers } from "ethers";
import { io } from "socket.io-client";
import { useAccount, useSignMessage, useDisconnect, useConnectorClient, useReadContract, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from "@/constants/PuffToken";
import { useSiweNonce, useVerifySiwe } from "@/hooks/useAuthQueries";
import { useNotification } from "@/contexts/NotificationContext";
import { useWalletStore } from "@/store/useWalletStore";

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
    const store = useWalletStore();
    const context = useContext(WalletContext);

    if (context) {
        return context;
    }

    return {
        connectWallet: async () => { },
        disconnectWallet: store.resetWalletState,
        account: store.account,
        provider: store.provider,
        signer: store.signer,
        isConnected: store.isConnected && store.isAuthenticated,
        isAuthenticated: store.isAuthenticated,
        puffBalance: store.puffBalance,
        error: store.error,
        user: store.user,
        refetchBalance: () => { },
    };
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { address, isConnected: isWalletConnected, status } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { data: client } = useConnectorClient();

    const {
        account,
        provider,
        signer,
        isAuthenticated,
        token,
        user,
        error,
        notification,
        isSigning,
        setAccount,
        setProvider,
        setSigner,
        setIsConnected,
        setIsAuthenticated,
        setToken,
        setUser,
        setPuffBalance,
        setError,
        setNotification,
        setIsSigning,
        resetWalletState,
    } = useWalletStore();

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

    const puffBalanceFormatted = balance
        ? parseFloat(ethers.formatUnits(balance as any, 18)).toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
        : "0";

    useEffect(() => {
        setPuffBalance(puffBalanceFormatted);
    }, [puffBalanceFormatted, setPuffBalance]);

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
    }, [client, setProvider, setSigner]);

    // Keep state in sync with wagmi account state
    useEffect(() => {
        if (address) {
            setAccount(address);
            setIsConnected(isWalletConnected);
        } else {
            setAccount(null);
            setIsConnected(false);
        }
    }, [address, isWalletConnected, setAccount, setIsConnected]);

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
    }, [setToken, setUser, setIsAuthenticated]);

    const { mutateAsync: fetchNonce } = useSiweNonce();
    const { mutateAsync: verifyAuth } = useVerifySiwe();

    // SIWE Login trigger
    const siweLogin = async (walletAddress: string) => {
        if (isSigning) return;
        setIsSigning(true);
        let toastId = "";
        try {
            setError(null);
            toastId = notify.loading("Authenticating Wallet...", "Please sign the SIWE request in your wallet.");

            // 1. GET message string with nonce using TanStack Query mutation
            const { message } = await fetchNonce(walletAddress);

            // 2. signMessage
            const signature = await signMessageAsync({ message });

            // 3. verify using TanStack Query mutation
            const verifyData = await verifyAuth({ message, signature, address: walletAddress });

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
    }, [address, isWalletConnected, setNotification, notify, refetchBalance]);

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
        resetWalletState();
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
                puffBalance: puffBalanceFormatted,
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