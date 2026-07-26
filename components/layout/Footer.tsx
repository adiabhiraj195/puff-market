'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Staatliches } from '@/lib/fonts';
import logo from '@/components/assets/full-moon-transparent-4.png';
import {
    FaGithub,
    FaLinkedin,
    FaEnvelope,
    FaExternalLinkAlt,
    FaCode,
    FaShieldAlt,
    FaCube,
    FaGavel,
    FaCompass,
    FaUser,
    FaLayerGroup
} from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

const statliche = Staatliches({
    weight: ['400'],
    subsets: ['latin'],
});

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#050608] text-white pt-16 pb-12 w-full border-t border-zinc-800/80 relative overflow-hidden z-20 selection:bg-blue-600/35 selection:text-white">
            {/* Background Decorative Ambient Glows */}
            <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-[140px] pointer-events-none z-0" />
            <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none z-0" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">

                {/* Top Grid Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Column 1: Brand & Developer Spotlight (5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <Link href="/" className="inline-flex items-center gap-3 group">
                            <Image
                                src={logo}
                                alt="Puff Market Logo"
                                className="w-10 h-10 group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className={`${statliche.className} text-2xl italic font-light tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent`}>
                                PUFF {`{MARKET}`}
                            </span>
                        </Link>

                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed max-w-md">
                            An open, non-custodial Web3 marketplace and gallery powering digital creators and collectors on Ethereum. Built with zero-gas EIP-2612 Permits, low-cost Minimal Proxy factories, and 24/7 real-time event indexing.
                        </p>

                        {/* Developer Attribution Card */}
                        <div className="p-4 rounded-2xl bg-[#0c0e14] border border-zinc-800/90 shadow-xl space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Application Developer</span>
                                </div>
                                <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">
                                    Lead Engineer
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div>
                                    <h4 className="text-base font-extrabold text-white tracking-tight">Aditya Raj</h4>
                                    <p className="text-[11px] text-gray-400">Full-Stack Web3 & Smart Contract Developer</p>
                                </div>

                                {/* Developer Direct Social Connections */}
                                <div className="flex items-center gap-2">
                                    <a
                                        href="https://x.com/adi_abhi_raj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-white border border-zinc-800 transition-all cursor-pointer"
                                        title="X (Twitter)"
                                    >
                                        <FaXTwitter className="w-3.5 h-3.5" />
                                    </a>

                                    <a
                                        href="https://www.linkedin.com/in/adiabhiraj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-blue-400 border border-zinc-800 transition-all cursor-pointer"
                                        title="LinkedIn"
                                    >
                                        <FaLinkedin className="w-3.5 h-3.5" />
                                    </a>

                                    <a
                                        href="mailto:adiabhiraj141@gmail.com"
                                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-amber-400 border border-zinc-800 transition-all cursor-pointer"
                                        title="Email"
                                    >
                                        <FaEnvelope className="w-3.5 h-3.5" />
                                    </a>

                                    <a
                                        href="https://github.com/adiabhiraj195"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-gray-300 hover:text-purple-400 border border-zinc-800 transition-all cursor-pointer"
                                        title="GitHub Repository"
                                    >
                                        <FaGithub className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Navigation Links (7 cols grid) */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8 pt-2">

                        {/* Quick Navigation Routes */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <FaCompass className="text-blue-400" />
                                Marketplace Routes
                            </h3>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <Link href="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Home Page
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/mint" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Mint Digital Asset
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/collection" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Collections Directory
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/auction" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Live Auctions
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/account" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        My Account Profile
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Platform Blueprint & Documentation */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <FaLayerGroup className="text-purple-400" />
                                Architecture & Specs
                            </h3>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <Link href="/architecture" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-purple-400" />
                                        Whitepaper Blueprint
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/architecture" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        System Topology
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/architecture" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Data Placement Matrix
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/architecture" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Dual Payment Modes
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/architecture" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5">
                                        <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                        Security & Etherscan
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Developer Connections */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <FaCode className="text-emerald-400" />
                                Developer Links
                            </h3>
                            <ul className="space-y-2.5 text-xs">
                                <li>
                                    <a
                                        href="https://x.com/adi_abhi_raj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <FaXTwitter className="text-gray-400 w-3.5 h-3.5" />
                                        X (Twitter) Profile
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.linkedin.com/in/adiabhiraj"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                                    >
                                        <FaLinkedin className="text-gray-400 w-3.5 h-3.5" />
                                        LinkedIn Profile
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="mailto:adiabhiraj141@gmail.com"
                                        className="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"
                                    >
                                        <FaEnvelope className="text-gray-400 w-3.5 h-3.5" />
                                        Email Direct Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/adiabhiraj195/puff-market"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2"
                                    >
                                        <FaGithub className="text-gray-400 w-3.5 h-3.5" />
                                        Project Source Repository
                                    </a>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>

                {/* Footer Bottom Bar */}
                <div className="pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <span>&copy; {new Date().getFullYear()} PUFF MARKET.</span>
                        <span className="text-gray-600">|</span>
                        <span>Developed with passion by <strong className="text-white">Aditya Raj</strong></span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-[11px]">
                        <a
                            href="https://sepolia.etherscan.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                        >
                            <FaShieldAlt className="text-emerald-400" />
                            Sepolia Contract Verified
                        </a>
                        <span className="text-gray-700">•</span>
                        <span className="text-gray-400">Non-Custodial Protocol</span>
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Footer;