"use client";

import React, { useEffect, useRef, useState, ReactNode } from "react";
import { ethers } from "ethers";
import { useAccount, useSignMessage, useDisconnect, useConnectorClient, useReadContract, useBalance } from "wagmi";
import { sepolia } from "wagmi/chains";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from "@/constants/PuffToken";
import { useSiweNonce, useVerifySiwe } from "@/hooks/useAuthQueries";
import { useNotification } from "@/providers/NotificationProvider";
import { useWalletStore } from "@/store/useWalletStore";

// Helper to decode and validate JWT payload
const decodeJwt = (jwtToken: string | null) => {
    if (!jwtToken) return null;
    try {
        const parts = jwtToken.split('.');
        if (parts.length !== 3) return null;
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const payload = JSON.parse(jsonPayload);
        if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
            return payload;
        }
        return null;
    } catch {
        try {
            const payload = JSON.parse(atob(jwtToken.split('.')[1]));
            if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
                return payload;
            }
            return null;
        } catch {
            return null;
        }
    }
};

export const useWallet = () => {
    const store = useWalletStore();

    return {
        connectWallet: store.connectWallet,
        disconnectWallet: store.disconnectWallet,
        account: store.account || store.user?.address || null,
        provider: store.provider,
        signer: store.signer,
        isConnected: store.isAuthenticated,
        isAuthenticated: store.isAuthenticated,
        puffBalance: store.puffBalance,
        error: store.error,
        user: store.user,
        refetchBalance: store.refetchBalance,
    };
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { address, isConnected: isWalletConnected, status } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { disconnect } = useDisconnect();
    const { openConnectModal } = useConnectModal();
    const { data: client } = useConnectorClient();

    const [isInitialized, setIsInitialized] = useState(false);

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
        setConnectWalletHandler,
        setDisconnectWalletHandler,
        setRefetchBalanceHandler,
    } = useWalletStore();

    const lastConnectionRef = useRef<{ address: string; chainId: number } | null>(null);
    const hasPromptedRef = useRef<string | null>(null);
    const checkedSepoliaRef = useRef<string | null>(null);

    const { notify } = useNotification();
    const { mutateAsync: fetchNonce } = useSiweNonce();
    const { mutateAsync: verifyAuth } = useVerifySiwe();

    const activeAddress = address || user?.address || account || null;

    // Get PUFF Token balance
    const { data: balance, refetch: refetchBalance } = useReadContract({
        address: PUFF_TOKEN_ADDRESS as `0x${string}`,
        abi: PUFF_TOKEN_ABI as any,
        functionName: 'balanceOf',
        args: activeAddress ? [activeAddress as `0x${string}`] : undefined,
        query: {
            enabled: !!activeAddress,
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
        address: activeAddress as `0x${string}`,
        chainId: sepolia.id,
        query: {
            enabled: !!activeAddress && isWalletConnected,
        }
    });

    // Check Sepolia ETH balance when wallet connects
    useEffect(() => {
        if (!isWalletConnected || !activeAddress) {
            checkedSepoliaRef.current = null;
            return;
        }

        const walletAddr = activeAddress.toLowerCase();

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
    }, [activeAddress, isWalletConnected, isSepoliaBalanceFetched, sepoliaBalance, notify]);

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

    // Sync wallet connection flag to Zustand
    useEffect(() => {
        setIsConnected(isWalletConnected);
    }, [isWalletConnected, setIsConnected]);

    // 1. Initial Mount Lifecycle: Load JWT from localStorage before checking wallet state
    useEffect(() => {
        const savedToken = localStorage.getItem("token");
        const payload = decodeJwt(savedToken);

        if (payload) {
            setToken(savedToken);
            setUser({ id: payload.id, address: payload.address });
            if (payload.address) {
                setAccount(payload.address);
            }
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem("token");
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsInitialized(true);
    }, [setToken, setUser, setIsAuthenticated, setAccount]);

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
                setAccount(walletAddress);
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
            hasPromptedRef.current = null;
        } finally {
            setIsSigning(false);
        }
    };

    // 4. Account Switch Safety & Wallet Auto-Login Effect
    useEffect(() => {
        if (!isInitialized || status === 'connecting' || status === 'reconnecting') {
            return;
        }

        const savedToken = localStorage.getItem("token");
        const payload = decodeJwt(savedToken);

        if (isWalletConnected && address) {
            const connectedAddress = address.toLowerCase();

            if (payload) {
                const jwtAddress = payload.address?.toLowerCase();

                if (jwtAddress && jwtAddress !== connectedAddress) {
                    // Account switch detected! Wallet address does not match JWT address.
                    console.log(`[Auth] Account switch detected (${jwtAddress} -> ${connectedAddress}). Re-authenticating.`);
                    localStorage.removeItem("token");
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    setToken(null);
                    setUser(null);
                    setIsAuthenticated(false);

                    if (hasPromptedRef.current !== connectedAddress) {
                        hasPromptedRef.current = connectedAddress;
                        siweLogin(address);
                    }
                } else {
                    // Wallet address matches active JWT token
                    setToken(savedToken);
                    setUser({ id: payload.id, address: payload.address });
                    setAccount(address);
                    setIsAuthenticated(true);
                }
            } else {
                // Wallet connected but no valid JWT token exists
                if (hasPromptedRef.current !== connectedAddress) {
                    hasPromptedRef.current = connectedAddress;
                    siweLogin(address);
                }
            }
        } else {
            hasPromptedRef.current = null;
        }
    }, [address, isWalletConnected, status, isInitialized, setToken, setUser, setIsAuthenticated, setAccount]);

    // Server-Sent Events (SSE) real-time connection for notifications
    useEffect(() => {
        if (!activeAddress) {
            return;
        }

        const walletAddress = activeAddress.toLowerCase();
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const sseUrl = `${apiUrl}/api/notifications/events?address=${walletAddress}`;

        console.log(`[SSE] Initializing notification stream for wallet: ${walletAddress}...`);
        const eventSource = new EventSource(sseUrl);

        eventSource.onopen = () => {
            console.log(`[SSE] Connected to notification stream for wallet: ${walletAddress}`);
        };

        eventSource.addEventListener("nft:sold", (event: MessageEvent) => {
            try {
                const data = JSON.parse(event.data);
                console.log("[SSE] Received nft:sold event:", data);
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
            } catch (err) {
                console.error("[SSE] Error parsing nft:sold event payload:", err);
            }
        });

        eventSource.onerror = (err) => {
            console.warn("[SSE] SSE connection notice/reconnecting:", err);
        };

        return () => {
            console.log("[SSE] Cleaning up SSE connection...");
            eventSource.close();
        };
    }, [activeAddress, setNotification, notify, refetchBalance]);

    // 3. Guard the Wallet Connection Flow
    const connectWallet = async () => {
        try {
            const savedToken = localStorage.getItem("token");
            const payload = decodeJwt(savedToken);

            if (payload) {
                // Valid token already exists - bypass SIWE flow completely
                setToken(savedToken);
                setUser({ id: payload.id, address: payload.address });
                if (payload.address) {
                    setAccount(payload.address);
                }
                setIsAuthenticated(true);

                // Reconnect wallet in Wagmi if not connected
                if (!isWalletConnected && openConnectModal) {
                    await openConnectModal();
                }
                return;
            }

            // No valid JWT token found
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
        hasPromptedRef.current = null;
        resetWalletState();
    };

    const connectWalletRef = useRef(connectWallet);
    connectWalletRef.current = connectWallet;

    const disconnectWalletRef = useRef(disconnectWallet);
    disconnectWalletRef.current = disconnectWallet;

    const refetchBalanceRef = useRef(refetchBalance);
    refetchBalanceRef.current = refetchBalance;

    useEffect(() => {
        setConnectWalletHandler(async () => {
            if (connectWalletRef.current) {
                await connectWalletRef.current();
            }
        });
        setDisconnectWalletHandler(() => {
            if (disconnectWalletRef.current) {
                disconnectWalletRef.current();
            }
        });
        setRefetchBalanceHandler(() => {
            if (refetchBalanceRef.current) {
                refetchBalanceRef.current();
            }
        });

        return () => {
            setConnectWalletHandler(null);
            setDisconnectWalletHandler(null);
            setRefetchBalanceHandler(null);
        };
    }, [setConnectWalletHandler, setDisconnectWalletHandler, setRefetchBalanceHandler]);

    return (
        <>
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
        </>
    );
};
