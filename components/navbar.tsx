'use client';

import React, { useState } from 'react'
import WalletConnectButton from './ui/buttons/connect-button'
import Link from 'next/link'
import { Staatliches } from 'next/font/google'
import logo from './assets/full-moon-transparent-4.png'
import Image from 'next/image'
import SearchBar from './ui/search-bar'
import { useWallet } from '@/contexts/WalletProvider'
import FaucetModal from './FaucetModal'

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

export default function Navbar() {
    const { isConnected, account, puffBalance, disconnectWallet } = useWallet();
    const [isFaucetOpen, setIsFaucetOpen] = useState(false);

    const balanceNum = parseFloat(puffBalance.replace(/,/g, '')) || 0;
    const isLowBalance = balanceNum < 1000;

    return (
        <div className='flex items-center justify-between py-2 px-8 w-full border-b border-gray-500 z-10' >
            <div className='flex items-center'>

                <Link href={"/"} className='flex gap-2 items-center mr-4'>
                    <Image src={logo} className='w-12' alt="logo" />
                    <h1 className={`${statliche.className} text-2xl italic font-light border-r pr-3 border-gray-500 `}>{`PUFF {MARKET}`}</h1>
                </Link>

                <Link href="/mint" className='mx-3 font-bold hover:text-gray-400'>
                    Mint NFT
                </Link>
                <Link href="/auction" className='mx-3 font-bold hover:text-gray-400'>
                    Auctions
                </Link>
            </div>

            <SearchBar />

            <div className='flex gap-4 items-center'>
                {isConnected ? (
                    <div className='flex items-center gap-3 bg-gray-950/60 backdrop-blur-md border border-gray-700/50 rounded-full pl-4 pr-2 py-1.5 shadow-lg shadow-black/20'>
                        {/* PUFF Balance */}
                        <div className='flex items-center gap-1.5 text-yellow-400 font-bold text-sm bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20'>
                            <span className='w-2 h-2 rounded-full bg-yellow-500 animate-pulse'></span>
                            {puffBalance} PUFF
                        </div>

                        {/* Get PUFF Button (faucet) */}
                        {isLowBalance && (
                            <button
                                onClick={() => setIsFaucetOpen(true)}
                                className='bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold text-xs px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-md shadow-yellow-500/10 active:scale-95 cursor-pointer border border-yellow-400/20 mr-1'
                            >
                                Get PUFF
                            </button>
                        )}

                        {/* Shortened Address & Profile Link */}
                        <Link href="/account" className='flex items-center gap-2 hover:bg-gray-800/80 px-3 py-1.5 rounded-full transition-all duration-200 border border-transparent hover:border-gray-600/30' title="Go to Profile">
                            <div className='w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-[10px] text-white font-bold uppercase shadow-sm'>
                                {account ? account.slice(2, 4) : "U"}
                            </div>
                            <span className='text-gray-200 font-semibold text-sm bg-transparent'>
                                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}
                            </span>
                        </Link>

                        {/* Disconnect Button */}
                        <button
                            onClick={disconnectWallet}
                            className='bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-full transition-all duration-200 cursor-pointer'
                            title="Disconnect Wallet"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-4 items-center'>
                        <WalletConnectButton />
                        <Link href={"/account"} className='bg-gray1 p-3 rounded-md hover:bg-gray3'>
                            <div className={`bg-blue-600 rounded-full p-3`}></div>
                        </Link>
                    </div>
                )}
            </div>

            {/* Faucet Modal */}
            <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
        </div>
    )
}


