"use client"

import React, { useState, useEffect } from 'react';
import HeroSection from "@/components/hero";
import { getNftListings } from "@/api/nft";
import { ListingInterface } from "@/types/nft-types";
import Link from 'next/link';
import { useReadContract } from 'wagmi';
import { PUFF_TOKEN_ADDRESS } from '@/constants/PuffToken';

function TokenSymbol({ address }: { address?: string }) {
  const tokenAddress = address || "0x0000000000000000000000000000000000000000";
  const isEth = tokenAddress === "0x0000000000000000000000000000000000000000";
  const isPuff = !isEth && tokenAddress.toLowerCase() === PUFF_TOKEN_ADDRESS.toLowerCase();

  const { data: symbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: [{ constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
    functionName: 'symbol',
    query: {
      enabled: !isEth && !isPuff && !!tokenAddress,
    }
  });

  return <span>{isEth ? 'ETH' : (isPuff ? 'PUFF' : (symbol || `${tokenAddress.slice(0, 6)}...${tokenAddress.slice(-4)}`))}</span>;
}

export default function Home() {
  const [listings, setListings] = useState<ListingInterface[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // States for search and filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<string>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = ['All', 'Art', 'Gaming', 'Memberships', 'PFPs', 'Photography', 'Music'];

  const fetchListings = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getNftListings();
      setListings(data || []);
    } catch (err) {
      console.error("Failed to fetch listings:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // Filter and sort listings
  useEffect(() => {
    let result = [...listings];

    // Search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.nft?.tokenId.toString().includes(query) ||
          item.seller?.address.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(
        (item: any) =>
          item.nft?.type?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Sort options
    if (sortOption === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortOption === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else {
      // 'recent'
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    setFilteredListings(result);
  }, [listings, searchQuery, selectedCategory, sortOption]);

  // Statistics calculations
  const floorPrice = listings.length > 0 
    ? Math.min(...listings.map(item => Number(item.price)))
    : 0;

  const totalVolume = listings.length > 0
    ? listings.reduce((sum, item) => sum + Number(item.price), 0)
    : 0;

  return (
    <div className="relative z-10 w-full selection:bg-blue-600/35 selection:text-white">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute top-64 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-12">
          
          {/* Market Overview Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-[#0c0d11]/80 border border-gray-800/80 rounded-2xl backdrop-blur-md shadow-2xl">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Collections</span>
              <span className="text-2xl font-black text-white">1</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Floor Price</span>
              <span className="text-2xl font-black text-yellow-400">{floorPrice.toLocaleString()} PUFF</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Total Volume</span>
              <span className="text-2xl font-black text-white">{totalVolume.toLocaleString()} PUFF</span>
            </div>
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block font-bold mb-1">Total Listings</span>
              <span className="text-2xl font-black text-blue-500">{listings.length} Listed</span>
            </div>
          </div>

          {/* Featured Carousels / Hero Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white">Featured Drops</h2>
                <p className="text-xs text-gray-400 mt-1">Discover trending NFT categories on the PUFF marketplace</p>
              </div>
              <button
                onClick={() => fetchListings(true)}
                disabled={refreshing || loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-gray-800 cursor-pointer disabled:opacity-50"
              >
                <svg className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.253 8H18" />
                </svg>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <HeroSection nftItems={listings} />
          </div>

          {/* Core Marketplace Section */}
          <div className="space-y-6">
            
            {/* Filter and layout control bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-[#0c0d11]/40 border border-gray-800/60 p-4 rounded-2xl backdrop-blur-sm">
              
              {/* Category selector */}
              <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none pb-2 md:pb-0">
                {categories.slice(0, 5).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                        : 'bg-transparent text-gray-400 hover:bg-gray-800/40 hover:text-white'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Action filters */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                {/* Search */}
                <div className="relative flex-1 md:flex-initial">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Token ID or Address"
                    className="w-full md:w-64 pl-9 pr-4 py-2 text-xs bg-black border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Sort selector */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="bg-black border border-gray-800 rounded-xl text-xs py-2 px-3 focus:outline-none text-gray-300 cursor-pointer"
                >
                  <option value="recent">Recently Listed</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>

                {/* View toggle */}
                <div className="flex border border-gray-800 rounded-xl overflow-hidden bg-black p-0.5">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'
                    }`}
                    title="Grid View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-all ${
                      viewMode === 'list' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-white'
                    }`}
                    title="List View"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* List and grid displays */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-[#131419]/60 border border-gray-800 animate-pulse rounded-2xl overflow-hidden p-4">
                    <div className="w-full aspect-square bg-[#0c0d10] rounded-xl mb-4" />
                    <div className="h-3.5 bg-gray-900 rounded w-1/3 mb-2" />
                    <div className="h-5 bg-gray-900 rounded w-2/3 mb-4" />
                    <div className="h-9 bg-gray-900 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              viewMode === 'grid' ? (
                /* Premium NFT Card Grid */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredListings.map((item) => (
                    <Link
                      href={`/nft/${item.nftId}`}
                      key={item.id}
                      className="group bg-[#131419]/35 hover:bg-[#131419]/70 border border-gray-800/80 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      <div className="w-full aspect-square overflow-hidden bg-[#0c0d10] relative">
                        <img
                          src={item.nft.imageURI}
                          alt={`Token #${item.nft.tokenId}`}
                          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                        <span className="absolute top-3 right-3 text-[10px] font-black bg-black/75 backdrop-blur-md text-gray-300 px-2.5 py-1.5 rounded-xl border border-white/5 shadow-md">
                          Token #{item.nft.tokenId}
                        </span>
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div className="mb-3">
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-0.5">Puff Collection</p>
                          <h3 className="text-sm font-black text-white truncate">NFT Asset</h3>
                          <p className="text-[10px] text-gray-500 mt-1.5 font-mono truncate">
                            Seller: {item.seller.address.slice(0, 6)}...{item.seller.address.slice(-4)}
                          </p>
                        </div>
                        <div className="flex justify-between items-center bg-[#0c0d10]/70 rounded-xl p-3 border border-gray-800/50">
                          <div>
                            <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider mb-0.5">Price</span>
                            <span className="text-sm font-black text-yellow-400">{Number(item.price).toLocaleString()} <TokenSymbol address={item.paymentToken} /></span>
                          </div>
                          <span className="text-[10px] font-black text-blue-400 group-hover:text-white transition-colors">
                            Buy Now →
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                /* Compact Elements Table List */
                <div className="overflow-x-auto bg-[#0c0d11]/40 border border-gray-800/60 rounded-2xl backdrop-blur-sm shadow-xl">
                  <table className="w-full border-collapse table-auto text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-xs text-gray-500 uppercase font-black tracking-wider">
                        <th className="py-4 px-6 w-16">Rank</th>
                        <th className="py-4 px-4">NFT Details</th>
                        <th className="py-4 px-4 w-44">Price</th>
                        <th className="py-4 px-4 w-44">Seller</th>
                        <th className="py-4 px-6 text-right w-28">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredListings.map((item, index) => (
                        <tr
                          key={item.id}
                          className="border-b border-gray-800/60 hover:bg-[#131419]/30 transition-all duration-150 align-middle"
                        >
                          <td className="py-4 px-6 text-sm font-bold text-gray-500">{index + 1}</td>
                          <td className="py-4 px-4 flex items-center gap-3">
                            <img
                              src={item.nft.imageURI}
                              alt={`Token #${item.nft.tokenId}`}
                              className="w-12 h-12 rounded-xl object-cover bg-[#0d0e12] border border-gray-800/80 shadow-md"
                            />
                            <div>
                              <span className="font-bold text-white block text-sm">Token #{item.nft.tokenId}</span>
                              <span className="text-[9px] text-gray-500 uppercase font-black tracking-wider block">Puff Collection</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1 text-sm font-black text-yellow-400">
                              {Number(item.price).toLocaleString()} <TokenSymbol address={item.paymentToken} />
                            </span>
                          </td>
                          <td className="py-4 px-4 text-xs font-mono text-gray-400">
                            {item.seller.address.slice(0, 8)}...{item.seller.address.slice(-6)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <Link
                              href={`/nft/${item.nftId}`}
                              className="inline-flex justify-center items-center text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-600/10 whitespace-nowrap active:scale-95"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              /* Beautiful Empty listings fallback */
              <div className="flex flex-col items-center justify-center p-16 bg-[#0c0d11]/40 border border-dashed border-gray-800 rounded-3xl text-center space-y-4 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-2xl shadow-inner shadow-black">
                  🛍️
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-300">No matching listings found</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    No active listings correspond to your query or selected filters. Try searching another token ID or clearing search terms.
                  </p>
                </div>
                {searchQuery || selectedCategory !== 'All' ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                    }}
                    className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 hover:text-blue-300 text-xs font-bold rounded-xl transition-all border border-blue-500/20 cursor-pointer"
                  >
                    Reset Filters
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
