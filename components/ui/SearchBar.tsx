import React from 'react';
import { IoSearchSharp } from "react-icons/io5";

const SearchBar = () => {
    return (
        <div id="tour-search-bar" className="flex items-center bg-zinc-900/40 border border-zinc-800/80 focus-within:border-blue-500/40 focus-within:bg-zinc-900/70 rounded-xl px-3.5 py-1.5 w-96 hover:bg-zinc-900/60 focus-within:shadow-lg focus-within:shadow-blue-500/5 transition-all duration-300">
            <IoSearchSharp className='text-zinc-400 font-extrabold text-lg mr-2 focus-within:text-blue-500 transition-colors' />

            <input
                type="text"
                placeholder="Search collections, NFTs..."
                className="bg-transparent text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none w-full"
            />

            <div className='px-1.5 py-0.5 bg-zinc-800 border border-zinc-700/50 rounded text-center text-[10px] text-zinc-500 font-mono shadow-sm'>
                <span>/</span>
            </div>
        </div>
    );
};

export default SearchBar;