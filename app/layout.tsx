import "./globals.css";
import type { Metadata } from "next";

import { WalletProvider } from "@/contexts/WalletProvider";
import { Apolloprovider } from "@/apolloProvider";
import { Provider } from "./provider";
import { Web3Provider } from "@/contexts/Web3Provider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import ToastContainer from "@/components/ui/ToastContainer";
import RenderWakeupBanner from "@/components/ui/RenderWakeupBanner";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OnboardingTutorial from "@/components/features/OnboardingTutorial";

export const metadata: Metadata = {
  title: "Puff Market",
  description: "Discover, buy, and sell exclusive digital assets on the leading NFT marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <Web3Provider>
          <Provider>
            <NotificationProvider>
              <WalletProvider>
                <Apolloprovider>
                  <RenderWakeupBanner />
                  <ToastContainer />
                  <div className="flex flex-col min-h-screen bg-[#060709] text-white">
                    <Navbar />
                    <OnboardingTutorial />
                    <main className="flex-grow w-full pt-20">
                      {children}
                    </main>
                    <Footer />
                  </div>
                </Apolloprovider>
              </WalletProvider>
            </NotificationProvider>
          </Provider>
        </Web3Provider>
      </body>
    </html>
  );
}


