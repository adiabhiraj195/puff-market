"use client"

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';

const HeroSection = ({ nftItems }: { nftItems: any }) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('All');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filters = ['All', 'Art', 'Gaming', 'Memberships', 'PFPs', 'Photography', 'Music'];

    const settings = {
        infinite: nftItems && nftItems.length > 3,
        speed: 800,
        slidesToShow: Math.min(3, nftItems?.length || 1),
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        cssEase: 'ease-in-out',
        pauseOnHover: true,
        arrows: false,
        dots: false,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: Math.min(2, nftItems?.length || 1),
                }
            },
            {
                breakpoint: 640,
                settings: {
                    slidesToShow: 1,
                }
            }
        ]
    };

    if (!mounted) {
        return (
            <div className="w-full space-y-6">
                <div className="flex space-x-2 overflow-x-auto bg-[#0d0e12]/60 border border-gray-800/80 p-2.5 rounded-xl">
                    {filters.map((filter) => (
                        <div key={filter} className="h-10 w-24 bg-gray-900 animate-pulse rounded-lg" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-80">
                    <div className="bg-[#131419] border border-gray-800 animate-pulse rounded-2xl h-full" />
                    <div className="bg-[#131419] border border-gray-800 animate-pulse rounded-2xl h-full hidden md:block" />
                    <div className="bg-[#131419] border border-gray-800 animate-pulse rounded-2xl h-full hidden md:block" />
                </div>
            </div>
        );
    }

    const filteredItems = nftItems?.filter((nft: any) => {
        if (selectedFilter === 'All') return true;
        return nft?.nft?.type?.toLowerCase() === selectedFilter.toLowerCase();
    }) || [];

    return (
        <div className="w-full space-y-6">
            {/* Filter categories pills */}
            <div className="flex space-x-2 overflow-x-auto bg-[#0d0e12]/60 border border-gray-800/80 p-2.5 rounded-xl scrollbar-none">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-5 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all duration-200 whitespace-nowrap active:scale-95 ${selectedFilter === filter
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/15'
                            : 'bg-transparent text-gray-400 hover:bg-gray-800/40 hover:text-white'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Slider carousel */}
            {filteredItems.length > 0 ? (
                <div className="relative slider-container">
                    <Slider {...settings}>
                        {filteredItems.map((nft: any, index: number) => (
                            <div key={index} className="px-3">
                                <Link
                                    href={`/nft/${nft.nftId}`}
                                    className="group block relative h-80 overflow-hidden rounded-2xl border border-gray-800/80 bg-[#131419] transition-all duration-300 hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1"
                                >
                                    {/* Asset image with hover scale */}
                                    <div className="w-full h-full overflow-hidden">
                                        <img
                                            src={nft.nft.imageURI}
                                            alt={`Token #${nft.nft.tokenId}`}
                                            className="object-cover h-full w-full transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Glassmorphic overlay card details */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent border-t border-white/5 backdrop-blur-[2px]">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Puff Collection</p>
                                                <p className="text-lg font-black text-white">Token #{nft.nft.tokenId}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="inline-block text-xs font-black bg-blue-600/90 text-white px-3 py-2 rounded-xl group-hover:bg-blue-600 transition-colors shadow-lg shadow-blue-600/20">
                                                    {Number(nft.price).toLocaleString()} PUFF
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </Slider>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-80 bg-[#0d0e12]/30 border border-dashed border-gray-800 rounded-2xl text-gray-500 p-8">
                    <span className="text-3xl mb-3">🏷️</span>
                    <p className="text-lg font-semibold text-gray-300">No active listings in this category</p>
                    <p className="text-sm text-gray-500 mt-1">Check back later or try choosing another filter.</p>
                </div>
            )}
        </div>
    );
};

export default HeroSection;

