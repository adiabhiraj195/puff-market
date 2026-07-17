import React from 'react';
import { IoAdd, IoTrashOutline } from "react-icons/io5";
import Loading from "@/components/ui/Loading";

interface Trait {
  key: string;
  value: string;
}

interface MintFormProps {
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  type: string;
  setType: (val: string) => void;
  externalLink: string;
  setExternalLink: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  traits: Trait[];
  handleAddTrait: () => void;
  handleRemoveTrait: (index: number) => void;
  handleTraitChange: (index: number, field: "key" | "value", value: string) => void;
  selectedCollection: string;
  setSelectedCollection: (val: string) => void;
  collections: any[];
  onDeployClick: () => void;
  uploadState: "idle" | "uploading" | "uploaded" | "error";
  selectedFile: File | null;
  errorMessage: string;
  onSubmit: (e: React.FormEvent) => void;
  defaultPuffNftAddress: string;
}

export default function MintForm({
  name,
  setName,
  description,
  setDescription,
  type,
  setType,
  externalLink,
  setExternalLink,
  author,
  setAuthor,
  traits,
  handleAddTrait,
  handleRemoveTrait,
  handleTraitChange,
  selectedCollection,
  setSelectedCollection,
  collections,
  onDeployClick,
  uploadState,
  selectedFile,
  errorMessage,
  onSubmit,
  defaultPuffNftAddress
}: MintFormProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <h3 className="text-lg font-bold text-zinc-200 border-b border-zinc-800 pb-3">NFT Details</h3>

      {/* Collection Selection */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-1.5 flex justify-between items-center">
          <span>NFT Collection *</span>
          <button
            type="button"
            onClick={onDeployClick}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
          >
            + Deploy New Collection
          </button>
        </label>
        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 transition-all text-sm cursor-pointer"
        >
          <option value={defaultPuffNftAddress}>Default Puff NFT Collection</option>
          {collections.map((col) => (
            <option key={col.contractAddress} value={col.contractAddress}>
              {col.name} ({col.symbol})
            </option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-1.5">Asset Name *</label>
        <input
          type="text"
          placeholder="Enter your NFT name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-1.5">Description *</label>
        <textarea
          placeholder="Describe your asset (supports markdown)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-blue-500 transition-all text-sm"
          required
        />
      </div>

      {/* Category Type */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-2">Category type</label>
        <div className="grid grid-cols-3 gap-2">
          {["art", "gaming", "membership", "pfps", "photography", "music", "other"].map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => setType(cat)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border capitalize transition-all ${
                type === cat
                  ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/10"
                  : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Creator / Author */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-1.5">Original Creator</label>
        <input
          type="text"
          placeholder="Creator name or pseudonym"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-blue-500 transition-all text-sm"
        />
      </div>

      {/* External Link */}
      <div>
        <label className="block text-sm font-bold text-zinc-300 mb-1.5">External Link</label>
        <input
          type="url"
          placeholder="https://yourwebsite.com"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-100 placeholder-zinc-650 focus:outline-none focus:border-blue-500 transition-all text-sm"
        />
      </div>

      {/* Traits / Attributes Section */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-bold text-zinc-300">Attribute Traits</label>
          <button
            type="button"
            onClick={handleAddTrait}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
          >
            <IoAdd /> Add Trait
          </button>
        </div>
        <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto pr-1">
          {traits.map((trait, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Trait type (e.g. Color)"
                value={trait.key}
                onChange={(e) => handleTraitChange(index, "key", e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
              />
              <input
                type="text"
                placeholder="Value (e.g. Blue)"
                value={trait.value}
                onChange={(e) => handleTraitChange(index, "value", e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-700 focus:outline-none focus:border-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => handleRemoveTrait(index)}
                className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all"
              >
                <IoTrashOutline size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Area */}
      <div className="border-t border-zinc-800/80 pt-6 mt-4">
        {uploadState === "uploading" ? (
          <div className="w-full flex flex-col items-center justify-center gap-2 py-2">
            <Loading />
            <span className="text-xs text-zinc-400 animate-pulse">Uploading file + generating thumbnail + pinning to IPFS...</span>
          </div>
        ) : (
          <button
            type="submit"
            disabled={!selectedFile || !name || !description}
            className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            Upload to IPFS
          </button>
        )}
        {errorMessage && (
          <p className="text-red-400 text-xs mt-3 text-center font-semibold bg-red-950/20 border border-red-500/10 rounded-lg p-2.5">
            {errorMessage}
          </p>
        )}
      </div>
    </form>
  );
}
