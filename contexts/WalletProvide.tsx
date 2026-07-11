"use client"

import React, { createContext, useState, useContext, useEffect, useRef, ReactNode } from "react";
import { ethers } from "ethers";
import { useAccount, useSignMessage, useDisconnect, useConnectorClient, useReadContract } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { PUFF_TOKEN_ADDRESS, PUFF_TOKEN_ABI } from "@/constants/PuffToken";
import { getSiweNonce, verifySiwe } from "@/api/auth";

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
    const { address, isConnected: isWalletConnected } = useAccount();
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

    const lastConnectionRef = useRef<{ address: string; chainId: number } | null>(null);

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
        try {
            setError(null);
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
            } else {
                throw new Error(verifyData.error || 'Authentication failed');
            }
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to authenticate wallet");
            // Clear on failure
            localStorage.removeItem('token');
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Auto-login or verify address matches JWT
    useEffect(() => {
        if (isWalletConnected && address) {
            const walletAddress = address.toLowerCase();
            let tokenAddress = "";

            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    tokenAddress = payload.address?.toLowerCase();
                } catch (e) {}
            }

            if (tokenAddress !== walletAddress) {
                siweLogin(address);
            }
        } else if (!isWalletConnected && isAuthenticated) {
            disconnectWallet();
        }
    }, [address, isWalletConnected, token]);

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
        </WalletContext.Provider>
    );
};