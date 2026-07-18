'use client';

import React, { useState, useEffect } from 'react'
import WalletConnectButton from './ConnectWalletButton'
import Link from 'next/link'
import { Staatliches } from '@/lib/fonts'
import logo from '@/components/assets/full-moon-transparent-4.png'
import Image from 'next/image'
import SearchBar from '@/components/ui/SearchBar'
import { useWallet } from '@/contexts/WalletProvider'
import FaucetModal from '@/components/features/FaucetModal'

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

export default function Navbar() {
    const { isConnected, account, puffBalance, disconnectWallet } = useWallet();
    const [isFaucetOpen, setIsFaucetOpen] = useState(false);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollPos = window.scrollY;
            
            // Allow small buffer before triggering change
            if (Math.abs(currentScrollPos - lastScrollY) < 10) {
                return;
            }

            if (currentScrollPos < 50) {
                setVisible(true);
            } else if (currentScrollPos > lastScrollY) {
                // Scrolling down -> hide navbar
                setVisible(false);
            } else {
                // Scrolling up -> show navbar
                setVisible(true);
            }

            lastScrollY = currentScrollPos;
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const balanceNum = parseFloat(puffBalance.replace(/,/g, '')) || 0;
    const isLowBalance = balanceNum < 1000;

    return (
        <div className={`flex items-center justify-between py-3 px-10 w-full border-b border-zinc-800/80 z-50 fixed top-0 left-0 right-0 transition-transform duration-300 bg-[#060709]/90 backdrop-blur-md shadow-lg ${visible ? 'translate-y-0' : '-translate-y-full'}`} >
            <div className='flex items-center'>

                <Link href={"/"} className='flex gap-2.5 items-center mr-6 group'>
                    <Image src={logo} className='w-10 group-hover:scale-105 transition-transform duration-300' alt="logo" />
                    <h1 className={`${statliche.className} text-xl italic font-light tracking-wide bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent border-r pr-4 border-zinc-800/80`}>{`PUFF {MARKET}`}</h1>
                </Link>

                <Link href="/mint" className='mx-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5'>
                    Mint NFT
                </Link>
                <Link href="/collection" className='mx-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5'>
                    Collections
                </Link>
                <Link href="/auction" className='mx-2.5 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-200 px-3 py-1.5 rounded-lg hover:bg-white/5'>
                    Auctions
                </Link>
            </div>

            <SearchBar />

            <div className='flex gap-4 items-center'>
                {isConnected ? (
                    <div className='flex items-center gap-3 bg-zinc-950/65 backdrop-blur-md border border-zinc-800/80 rounded-full pl-4 pr-2 py-1.5 shadow-lg shadow-black/35'>
                        {/* PUFF Balance */}
                        <div className='flex items-center gap-1.5 text-yellow-400 font-bold text-xs bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20'>
                            <span className='w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse'></span>
                            {puffBalance} PUFF
                        </div>

                        {/* Get PUFF Button (faucet) */}
                        {isLowBalance && (
                            <button
                                onClick={() => setIsFaucetOpen(true)}
                                className='bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded-full transition-all duration-200 shadow-md shadow-yellow-500/10 active:scale-95 cursor-pointer border border-yellow-400/20 mr-1'
                            >
                                Get PUFF
                            </button>
                        )}

                        {/* Shortened Address & Profile Link */}
                        <Link href="/account" className='flex items-center gap-2 hover:bg-zinc-800/50 px-2.5 py-1 rounded-full transition-all duration-200 border border-transparent hover:border-zinc-700/30' title="Go to Profile">
                            <div className='w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-650 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-inner'>
                                {account ? account.slice(2, 4) : "U"}
                            </div>
                            <span className='text-zinc-200 font-medium text-xs bg-transparent'>
                                {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ""}
                            </span>
                        </Link>

                        {/* Disconnect Button */}
                        <button
                            onClick={disconnectWallet}
                            className='bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 p-2 rounded-full transition-all duration-200 cursor-pointer'
                            title="Disconnect Wallet"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className='flex gap-3 items-center'>
                        <WalletConnectButton />
                        <Link href={"/account"} className='flex items-center justify-center p-2 rounded-full border border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 transition-colors duration-200' title="Profile">
                            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </Link>
                    </div>
                )}
            </div>

            {/* Faucet Modal */}
            <FaucetModal isOpen={isFaucetOpen} onClose={() => setIsFaucetOpen(false)} />
        </div>
    )
}


