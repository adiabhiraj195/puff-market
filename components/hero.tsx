"use client"

import Link from 'next/link';
import React, { useState } from 'react';
import Slider from 'react-slick';

const HeroSection = ({ nftItems }: { nftItems: any }) => {
    const [selectedFilter, setSelectedFilter] = useState<string>('All');

    const filters = ['All', 'Art', 'Gaming', 'Memberships', 'PFPs', 'Photography', 'Music'];

    const settings = {
        infinite: true,
        speed: 5000,
        slidesToShow: 3,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 0,
        cssEase: '',
        pauseOnHover: true,
        arrows: false, // Enable or disable the arrows
    };

    return (
        <div className='w-full'>
            <div className="flex space-x-4 bg-black py-4 rounded-lg">
                {filters.map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`px-4 py-2 hover:bg-gray3 rounded-md text-white ${selectedFilter === filter
                            ? 'bg-gray3 font-semibold'
                            : 'bg-transparent text-gray-400 hover:text-white'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <Slider {...settings} className='flex'>

                {nftItems?.map((nft: any, index: number) => {
                    console.log(nft.nft.type)
                    if (selectedFilter !== "All") {
                        if (nft.nft.type !== selectedFilter.toLowerCase()) return;
                    }

                    return (
                        <Link href={`/nft/${nft.nftId}`} key={index} className='p-2 hover:border-2 rounded-lg hover:border-blue-500 overflow-hidden'>
                            <div className=" bg-cover bg-center overflow-hidden text-white relative h-80 ">
                                <img
                                    src={nft.nft.imageURI}
                                    alt={nft.nft.tokenId}
                                    className="object-cover h-full w-full"
                                />
                                <div className="p-3 flex absolute bottom-0 w-full bg-transparent justify-between items-center">
                                    <p className="text-md font-bold">#{nft.nft.tokenId}</p>
                                    <span className="text-xs font-bold bg-blue-600 text-white px-3 py-1.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
                                        Buy for {Number(nft.price).toLocaleString()} PUFF
                                    </span>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </Slider>
        </div>
    );
};

export default HeroSection;

