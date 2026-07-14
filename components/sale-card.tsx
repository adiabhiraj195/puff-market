import React from "react";
import { FaShoppingCart, FaRegClock } from "react-icons/fa";
import { FiTag } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";

import Cancel_Listing_Button from "@/components/ui/buttons/cancel-listing-button";

const SaleCard = ({
    nftPrice,
    nftAddress,
    tokenId,
    ownerId,
    nftId,
    isOwner = false,
    onListClick,
    onBuyClick,
    onCancelSuccess
}: {
    nftPrice?: string
    nftAddress: string
    tokenId: string
    ownerId: string
    nftId: string
    isOwner?: boolean
    onListClick?: () => void
    onBuyClick?: () => void
    onCancelSuccess?: () => void
}) => {

    return (
        <div className="bg-[#121214]/65 backdrop-blur-md border border-neutral-800/80 my-5 text-white p-6 rounded-2xl w-full shadow-xl">
            {/* Sale Info */}
            <div className="flex items-center gap-2 text-neutral-400 text-sm mb-5 pb-4 border-b border-neutral-800/60">
                <FaRegClock className="text-blue-400" />
                <p>Sale ends <strong>15 December 2026</strong> at <strong>12:00 pm</strong></p>
            </div>

            {/* Price */}
            <div className="mb-6">
                <p className="text-neutral-400 text-xs font-semibold uppercase tracking-wider mb-2">Current price</p>
                <div className="flex items-baseline gap-2">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                        {nftPrice ? `${Number(nftPrice).toLocaleString()} PUFF` : 'Not Listed'}
                    </h1>
                    {nftPrice && (
                        <span className="text-neutral-500 text-sm font-medium">
                            (~ ${(Number(nftPrice) * 0.05).toFixed(2)})
                        </span>
                    )}
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
                {isOwner ? (
                    nftPrice ? (
                        <div className="w-full flex justify-start">
                            <Cancel_Listing_Button
                                nftId={nftId}
                                nftAddress={nftAddress}
                                tokenId={tokenId}
                                onSuccess={onCancelSuccess}
                            />
                        </div>
                    ) : (
                        <button 
                            onClick={onListClick} 
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl w-full shadow-lg hover:shadow-blue-500/20 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                        >
                            List for Sale <FiTag size={16} />
                        </button>
                    )
                ) : (
                    nftPrice ? (
                        <>
                            <button 
                                onClick={onBuyClick} 
                                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 px-6 rounded-xl w-full sm:w-1/2 shadow-lg hover:shadow-blue-500/25 active:scale-[0.99] transition-all duration-200 cursor-pointer"
                            >
                                Buy now <FaShoppingCart size={16} />
                            </button>
                            <button className="flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-white font-bold py-3.5 px-6 rounded-xl w-full sm:w-1/2 active:scale-[0.99] transition-all duration-200 cursor-pointer">
                                <FiTag size={16} /> Make offer
                            </button>
                        </>
                    ) : (
                        <button disabled className="flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-800 text-neutral-500 font-bold py-3.5 px-6 rounded-xl w-full cursor-not-allowed">
                            Not listed for sale
                        </button>
                    )
                )}
            </div>

            {/* Support Creator */}
            <div className="flex items-center gap-2.5 mt-6 text-neutral-400 text-xs border-t border-neutral-800/40 pt-4">
                <AiFillHeart className="text-red-500 animate-pulse" size={16} />
                <p>
                    <span className="font-semibold text-white">Supports creator.</span> This listing pays the creator their full suggested creator earnings.
                </p>
            </div>
        </div>
    );
};

export default SaleCard;