"use client";

import React from "react";
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";
import { sepolia, localhost } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@rainbow-me/rainbowkit/styles.css";

// Create custom localhost configuration with local chain id 31337
const config = getDefaultConfig({
  appName: "PUFF Marketplace",
  projectId: "1b95ce70e28bbd9122fb39fa5a40954b", // Dummy Project ID for development
  chains: [localhost, sepolia],
  ssr: true,
  transports: {
    [localhost.id]: http("http://127.0.0.1:8545"),
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
