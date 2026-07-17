import React from 'react';
import { IoSearchSharp } from "react-icons/io5";

const SearchBar = () => {
    return (
        <div className="flex items-center bg-gray1 rounded-xl px-3 py-2 w-96 hover:bg-gray2 ">
            <IoSearchSharp className='bg-transparent font-extrabold text-lg' />

            <input
                type="text"
                placeholder="Search"
                className="bg-transparent text-gray-300 placeholder-gray-500 focus:outline-none ml-2 w-full"
            />

            <div className='px-2 py-1 bg-gray3 rounded-md text-center'>
                <span className="bg-transparent">/</span>
            </div>

        </div>
    );
};

export default SearchBar;