import React from "react";
import { FaHandshake } from "react-icons/fa"; // For handshake icon
import { FiShare2, FiExternalLink, FiCopy } from "react-icons/fi"; // Icons
import { HiDotsHorizontal } from "react-icons/hi"; // For three dots
import { MdVerified } from "react-icons/md"; // Verified icon

const ListingHeader = ({
    name,
    tokenId,
    owner
}: {
    name: string
    tokenId: string
    owner: string
}) => {
    const handleCopy = () => {
        if (owner) {
            navigator.clipboard.writeText(owner);
            alert("Address copied to clipboard!");
        }
    };

    const displayOwner = owner 
        ? `${owner.slice(0, 6)}...${owner.slice(-4)}`
        : "N/A";

    return (
        <div className="text-white pb-6 pt-2 flex flex-col md:flex-row w-full justify-between items-start md:items-center gap-4">
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold tracking-widest text-blue-400 uppercase">
                        Puff NFT Collection
                    </span>
                    <MdVerified className="text-blue-400" size={14} />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent flex items-center gap-3">
                    {name || "Unnamed NFT"} <span className="text-neutral-500 font-medium text-2xl">#{tokenId || "0"}</span>
                </h1>
                <div className="mt-2 flex items-center gap-3 text-sm text-neutral-400">
                    <span>Owned by</span>
                    <button 
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer hover:underline bg-neutral-900/40 hover:bg-neutral-900/80 px-2.5 py-1 rounded-lg border border-neutral-800"
                        title="Copy Address"
                    >
                        {displayOwner}
                        <FiCopy size={12} className="opacity-60" />
                    </button>
                </div>
            </div>

            <div className="flex gap-2.5 items-center self-stretch md:self-auto justify-end">
                <button 
                    className="flex items-center justify-center p-2.5 bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/80 rounded-xl transition-all duration-200 text-neutral-300 hover:text-white"
                    title="Offers"
                >
                    <FaHandshake size={18} />
                </button>
                <button 
                    className="flex items-center justify-center p-2.5 bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/80 rounded-xl transition-all duration-200 text-neutral-300 hover:text-white"
                    title="Share"
                >
                    <FiShare2 size={18} />
                </button>
                <button 
                    className="flex items-center justify-center p-2.5 bg-neutral-900/40 hover:bg-neutral-800 border border-neutral-800/80 rounded-xl transition-all duration-200 text-neutral-300 hover:text-white"
                    title="More options"
                >
                    <HiDotsHorizontal size={18} />
                </button>
            </div>
        </div>
    );
};

export default ListingHeader;