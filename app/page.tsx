"use client"

import React, { useState, useEffect } from 'react';
import FeaturedDropsCarousel from "@/components/features/FeaturedDropsCarousel";
import { getNftListings, getAllCollections } from "@/api/nft";
import { ListingInterface } from "@/types/nft-types";
import MarketStats from "@/components/features/MarketStats";
import ListingFilters from "@/components/features/ListingFilters";
import ListingCard from "@/components/features/ListingCard";
import NftTableList from "@/components/features/NftTableList";
import EmptyListingsState from "@/components/features/EmptyListingsState";

export default function Home() {
  const [listings, setListings] = useState<ListingInterface[]>([]);
  const [filteredListings, setFilteredListings] = useState<ListingInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [collectionsCount, setCollectionsCount] = useState<number>(1);

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
      const [listingsData, collectionsData] = await Promise.all([
        getNftListings(),
        getAllCollections().catch(() => [])
      ]);
      setListings(listingsData || []);
      setCollectionsCount(collectionsData && collectionsData.length > 0 ? collectionsData.length : 1);
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
          <div id="tour-market-stats">
            <MarketStats
              collectionsCount={collectionsCount}
              floorPrice={floorPrice}
              totalVolume={totalVolume}
              listingsCount={listings.length}
            />
          </div>

          {/* Featured Carousels / Hero Section */}
          <div id="tour-featured-drops" className="space-y-4">
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
            <FeaturedDropsCarousel nftItems={listings} />
          </div>

          {/* Core Marketplace Section */}
          <div className="space-y-6">
            
            {/* Filter and layout control bar */}
            <div id="tour-listing-filters">
              <ListingFilters
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                sortOption={sortOption}
                setSortOption={setSortOption}
                viewMode={viewMode}
                setViewMode={setViewMode}
                categories={categories}
              />
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
                    <ListingCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                /* Compact Elements Table List */
                <NftTableList filteredListings={filteredListings} />
              )
            ) : (
              /* Beautiful Empty listings fallback */
              <EmptyListingsState
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                setSearchQuery={setSearchQuery}
                setSelectedCategory={setSelectedCategory}
              />
            )}
          </div>
        </div>
    </div>
  );
}
