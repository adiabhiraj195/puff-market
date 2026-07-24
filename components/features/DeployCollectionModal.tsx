import React from 'react';

interface DeployCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCollName: string;
  setNewCollName: (name: string) => void;
  newCollSymbol: string;
  setNewCollSymbol: (symbol: string) => void;
  isDeploying: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function DeployCollectionModal({
  isOpen,
  onClose,
  newCollName,
  setNewCollName,
  newCollSymbol,
  setNewCollSymbol,
  isDeploying,
  onSubmit
}: DeployCollectionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Deploy Custom NFT Collection</h2>
          <button
            onClick={onClose}
            disabled={isDeploying}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit} className="p-6 flex flex-col gap-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deploys an ERC-721 collection contract using the ERC1167 Minimal Proxy pattern. Setup cost is ~95% cheaper than normal deployment. You will be the owner.
          </p>

          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Collection Name *
            </label>
            <input
              type="text"
              placeholder="e.g. My Custom Collection"
              value={newCollName}
              onChange={(e) => setNewCollName(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
              required
              disabled={isDeploying}
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Collection Symbol *
            </label>
            <input
              type="text"
              placeholder="e.g. MCC"
              value={newCollSymbol}
              onChange={(e) => setNewCollSymbol(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-700 text-sm font-semibold transition-all"
              required
              disabled={isDeploying}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end border-t border-zinc-800/80 pt-5 mt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeploying}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isDeploying}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isDeploying ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deploying...
                </>
              ) : (
                "Deploy Collection"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
