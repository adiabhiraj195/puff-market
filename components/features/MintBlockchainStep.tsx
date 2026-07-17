import React from 'react';

interface MintBlockchainStepProps {
  mintState: "idle" | "signing" | "pending" | "confirmed" | "error";
  hash?: string;
  errorMessage: string;
  handleMintNFT: () => void;
  handleGoBack: () => void;
}

export default function MintBlockchainStep({
  mintState,
  hash,
  errorMessage,
  handleMintNFT,
  handleGoBack
}: MintBlockchainStepProps) {
  return (
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
            onClick={handleGoBack}
            className="w-full py-3 px-6 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-300 font-bold text-sm transition-all cursor-pointer"
          >
            Go Back & Edit
          </button>
        )}
      </div>
    </div>
  );
}
