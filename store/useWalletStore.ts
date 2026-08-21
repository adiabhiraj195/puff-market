import { create } from "zustand";
import { ethers } from "ethers";

export interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  isConnected: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  puffBalance: string;
  error: string | null;
  notification: { message: string } | null;
  isSigning: boolean;

  setAccount: (account: string | null) => void;
  setProvider: (provider: ethers.BrowserProvider | null) => void;
  setSigner: (signer: ethers.Signer | null) => void;
  setIsConnected: (isConnected: boolean) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setToken: (token: string | null) => void;
  setUser: (user: any | null) => void;
  setPuffBalance: (balance: string) => void;
  setError: (error: string | null) => void;
  setNotification: (notification: { message: string } | null) => void;
  setIsSigning: (isSigning: boolean) => void;
  resetWalletState: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  account: null,
  provider: null,
  signer: null,
  isConnected: false,
  isAuthenticated: false,
  token: null,
  user: null,
  puffBalance: "0",
  error: null,
  notification: null,
  isSigning: false,

  setAccount: (account) => set({ account }),
  setProvider: (provider) => set({ provider }),
  setSigner: (signer) => set({ signer }),
  setIsConnected: (isConnected) => set({ isConnected }),
  setIsAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setToken: (token) => set({ token }),
  setUser: (user) => set({ user }),
  setPuffBalance: (puffBalance) => set({ puffBalance }),
  setError: (error) => set({ error }),
  setNotification: (notification) => set({ notification }),
  setIsSigning: (isSigning) => set({ isSigning }),

  resetWalletState: () =>
    set({
      account: null,
      provider: null,
      signer: null,
      isConnected: false,
      isAuthenticated: false,
      token: null,
      user: null,
      puffBalance: "0",
      error: null,
      notification: null,
      isSigning: false,
    }),
}));
