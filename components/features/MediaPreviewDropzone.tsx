import React from 'react';
import { IoCloudUploadOutline } from "react-icons/io5";

interface MediaPreviewDropzoneProps {
  uploadState: "idle" | "uploading" | "uploaded" | "error";
  previewUrl: string | null;
  selectedFile: File | null;
  isDragActive: boolean;
  name: string;
  description: string;
  type: string;
  tokenURI: string;
  ipfsMetadata: any;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  handleFileBrowse: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MediaPreviewDropzone({
  uploadState,
  previewUrl,
  selectedFile,
  isDragActive,
  name,
  description,
  type,
  tokenURI,
  ipfsMetadata,
  handleDrag,
  handleDrop,
  handleFileBrowse
}: MediaPreviewDropzoneProps) {
  return (
    <div className="flex flex-col gap-6">
      <h3 className="text-lg font-bold text-zinc-200">Media Preview</h3>

      {uploadState !== "uploaded" ? (
        /* Input Dropzone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center min-h-[400px] p-6 transition-all duration-200 bg-zinc-900/30 ${
            isDragActive
              ? "border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5"
              : "border-zinc-800 hover:border-zinc-700"
          } relative overflow-hidden group`}
        >
          {previewUrl ? (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-zinc-955">
              {selectedFile?.type.startsWith("video/") ? (
                <video src={previewUrl} controls className="max-w-full max-h-full object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
              )}
              <label
                htmlFor="replace-file"
                className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white text-xs px-3 py-1.5 rounded-full border border-zinc-800 cursor-pointer backdrop-blur-sm transition-all"
              >
                Change File
              </label>
              <input
                type="file"
                id="replace-file"
                className="hidden"
                onChange={handleFileBrowse}
                accept="image/*,video/*"
              />
            </div>
          ) : (
            <div className="text-center flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:scale-105 group-hover:text-zinc-200 transition-all shadow-md">
                <IoCloudUploadOutline size={28} />
              </div>
              <div>
                <label htmlFor="file-input" className="text-blue-400 hover:text-blue-300 font-semibold cursor-pointer underline underline-offset-2">
                  Click to upload
                </label>
                <span className="text-zinc-500"> or drag and drop</span>
              </div>
              <div className="text-xs text-zinc-500 flex flex-col gap-1">
                <span>Supports images (PNG, JPG, GIF, SVG) or videos (MP4)</span>
                <span>Max size: 50MB</span>
              </div>
              <input
                type="file"
                id="file-input"
                className="hidden"
                onChange={handleFileBrowse}
                accept="image/*,video/*"
              />
            </div>
          )}
        </div>
      ) : (
        /* Uploaded / Ready-to-Mint NFT Preview Card */
        <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
          <div className="w-full h-80 rounded-xl overflow-hidden bg-zinc-950 flex items-center justify-center border border-zinc-900">
            {selectedFile?.type.startsWith("video/") ? (
              <video src={previewUrl!} controls className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={previewUrl!} alt="NFT Preview" className="max-w-full max-h-full object-contain" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
              {type}
            </span>
            <h2 className="text-2xl font-extrabold mt-3">{name}</h2>
            <p className="text-zinc-400 text-sm mt-1 leading-relaxed">{description}</p>
          </div>

          {/* Show IPFS Links */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-xs font-mono text-zinc-400 flex flex-col gap-2">
            <div className="flex justify-between items-center gap-4">
              <span className="font-bold text-zinc-500">Metadata URL:</span>
              <a href={tokenURI} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                {tokenURI}
              </a>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="font-bold text-zinc-500">Media URL:</span>
              <a href={ipfsMetadata?.image} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate max-w-xs">
                {ipfsMetadata?.image}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
