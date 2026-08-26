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

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refetchBalance: () => void;

  // Handlers setters
  setConnectWalletHandler: (handler: (() => Promise<void>) | null) => void;
  setDisconnectWalletHandler: (handler: (() => void) | null) => void;
  setRefetchBalanceHandler: (handler: (() => void) | null) => void;

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

interface InternalWalletState extends WalletState {
  _connectWalletHandler: (() => Promise<void>) | null;
  _disconnectWalletHandler: (() => void) | null;
  _refetchBalanceHandler: (() => void) | null;
}

export const useWalletStore = create<InternalWalletState>((set, get) => ({
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

  _connectWalletHandler: null,
  _disconnectWalletHandler: null,
  _refetchBalanceHandler: null,

  connectWallet: async () => {
    const handler = get()._connectWalletHandler;
    if (handler) {
      await handler();
    }
  },
  disconnectWallet: () => {
    const handler = get()._disconnectWalletHandler;
    if (handler) {
      handler();
    } else {
      get().resetWalletState();
    }
  },
  refetchBalance: () => {
    const handler = get()._refetchBalanceHandler;
    if (handler) {
      handler();
    }
  },

  setConnectWalletHandler: (handler) => set({ _connectWalletHandler: handler }),
  setDisconnectWalletHandler: (handler) => set({ _disconnectWalletHandler: handler }),
  setRefetchBalanceHandler: (handler) => set({ _refetchBalanceHandler: handler }),

  setAccount: (account) => set((state) => (state.account === account ? state : { account })),
  setProvider: (provider) => set((state) => (state.provider === provider ? state : { provider })),
  setSigner: (signer) => set((state) => (state.signer === signer ? state : { signer })),
  setIsConnected: (isConnected) => set((state) => (state.isConnected === isConnected ? state : { isConnected })),
  setIsAuthenticated: (isAuthenticated) => set((state) => (state.isAuthenticated === isAuthenticated ? state : { isAuthenticated })),
  setToken: (token) => set((state) => (state.token === token ? state : { token })),
  setUser: (user) => set((state) => (state.user === user ? state : { user })),
  setPuffBalance: (puffBalance) => set((state) => (state.puffBalance === puffBalance ? state : { puffBalance })),
  setError: (error) => set((state) => (state.error === error ? state : { error })),
  setNotification: (notification) => set((state) => (state.notification === notification ? state : { notification })),
  setIsSigning: (isSigning) => set((state) => (state.isSigning === isSigning ? state : { isSigning })),

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


