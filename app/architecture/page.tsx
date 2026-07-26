'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  FaCube,
  FaDatabase,
  FaNetworkWired,
  FaShieldAlt,
  FaExchangeAlt,
  FaCoins,
  FaLock,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaBolt,
  FaHistory,
  FaLayerGroup,
  FaSlidersH,
  FaFileCode,
  FaKey,
  FaClock,
  FaQuestionCircle,
  FaBook,
  FaTerminal
} from 'react-icons/fa';
import {
  HiSparkles,
  HiLightningBolt,
  HiOutlineSwitchHorizontal,
  HiShieldCheck,
  HiDocumentText
} from 'react-icons/hi';
import { Staatliches } from '@/lib/fonts';

const statliche = Staatliches({
  weight: ['400'],
  subsets: ['latin'],
});

// Data definitions for the Whitepaper architecture
interface TechCard {
  name: string;
  category: string;
  role: string;
  rationale: string;
  badge: string;
  color: string;
}

const TECH_STACK: TechCard[] = [
  {
    name: 'Next.js 14 & React 18',
    category: 'Frontend Client',
    role: 'Provides App Router, SSR/CSR rendering, fast UI updates, and responsive layouts.',
    rationale: 'Allows seamless client-side Web3 hydration combined with fast static metadata previews for NFTs.',
    badge: 'UI Framework',
    color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30',
  },
  {
    name: 'Wagmi, Viem & Ethers v6',
    category: 'Web3 Integration',
    role: 'Handles wallet state, smart contract read/write calls, transaction signing, and EIP-2612 Permits.',
    rationale: 'Ensures type-safe Ethereum RPC interactions, instant nonce signing, and reliable event polling.',
    badge: 'Blockchain Client',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
  },
  {
    name: 'RainbowKit',
    category: 'Wallet Connection',
    role: 'Provides clean wallet selection modal supporting MetaMask, Coinbase Wallet, Trust Wallet, and WalletConnect.',
    rationale: 'Delivers zero-friction onboarding with custom theme styling matching the PUFF dark aesthetic.',
    badge: 'Auth Modal',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  },
  {
    name: 'Solidity 0.8+ Smart Contracts',
    category: 'Blockchain Layer',
    role: 'Defines canonical business rules for ERC-20 token, ERC-721 NFT, Marketplace, Auction Vault, and Proxy Factory.',
    rationale: 'Built-in overflow checks, gas-optimized storage slots, and EIP standards compatibility.',
    badge: 'On-Chain Rules',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
  },
  {
    name: 'Pinata & IPFS',
    category: 'Decentralized Storage',
    role: 'Stores high-resolution artwork, MP4 video assets, video thumbnails, and standardized ERC-721 JSON metadata.',
    rationale: 'Ensures permanent content addressing (CIDs) so artwork can never be modified, replaced, or lost.',
    badge: 'P2P Storage',
    color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
  },
  {
    name: 'Node.js & Socket.IO Event Listener',
    category: 'Real-Time Indexer',
    role: 'Listens 24/7 to Ethereum Sepolia contract events and pushes live websocket toast notifications to client UI.',
    rationale: 'Eliminates page reloads for live auctions, outbid alerts, and purchase updates within milliseconds.',
    badge: 'Real-Time Indexer',
    color: 'from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30',
  },
  {
    name: 'Prisma ORM & PostgreSQL',
    category: 'Database Cache',
    role: 'Indexes block events into structured tables for instant search, filtering, and profile metadata management.',
    rationale: 'Acts as a high-speed read cache without replacing the Ethereum blockchain as single source of truth.',
    badge: 'Read Cache',
    color: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/30',
  },
  {
    name: 'ERC-1167 Minimal Proxy Factory',
    category: 'Smart Contract Factory',
    role: 'Deploys lightweight collection clones for creators launching custom digital asset collections.',
    rationale: 'Reduces contract deployment gas fees by 90%–95%, making collection creation affordable for everyone.',
    badge: 'Gas Optimizer',
    color: 'from-violet-500/20 to-purple-500/20 text-violet-400 border-violet-500/30',
  },
];

interface DataMatrixItem {
  asset: string;
  location: 'On-Chain' | 'IPFS' | 'Database';
  reason: string;
  immutability: string;
}

const DATA_MATRIX: DataMatrixItem[] = [
  {
    asset: 'NFT Artwork & Video Files',
    location: 'IPFS',
    reason: 'Files are too large for direct blockchain storage. P2P content-addressed CIDs ensure files can never be altered.',
    immutability: '100% Immutable (Content Addressed)',
  },
  {
    asset: 'NFT Video Thumbnails',
    location: 'IPFS',
    reason: 'Automatically extracted image previews are pinned to IPFS for fast grid loading without downloading huge videos.',
    immutability: '100% Immutable',
  },
  {
    asset: 'NFT Metadata (Name, Description, Attributes)',
    location: 'IPFS',
    reason: 'Standardized JSON document stored on IPFS. Smart contract tokenURI points directly to this permanent document.',
    immutability: '100% Immutable',
  },
  {
    asset: 'Canonical Ownership Records',
    location: 'On-Chain',
    reason: 'Ethereum blockchain holds immutable truth of token owner addresses. Cannot be edited by server operators.',
    immutability: '100% Immutable Ledger',
  },
  {
    asset: 'PUFF Coin Balances',
    location: 'On-Chain',
    reason: 'Managed by official ERC-20 smart contract. Transfers and approvals require cryptographic key signatures.',
    immutability: '100% Immutable Ledger',
  },
  {
    asset: 'Transaction & Auction History',
    location: 'On-Chain',
    reason: 'Raw event logs are permanently saved in block headers. Database indexes them locally for fast UI filtering.',
    immutability: '100% On-Chain Truth + Local Cache',
  },
  {
    asset: 'User Profile Info (Display Name, Bio, Avatar)',
    location: 'Database',
    reason: 'Optional user preferences stored in PostgreSQL. Updated securely by signing wallet authorization messages.',
    immutability: 'Editable by Authorized Owner',
  },
  {
    asset: 'Wallet Address Mappings',
    location: 'On-Chain',
    reason: 'Public addresses map directly to owned Token IDs and PUFF coin balances across all smart contracts.',
    immutability: '100% Immutable Ledger',
  },
];

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const FAQS: FAQItem[] = [
  {
    category: 'Security & Ownership',
    question: 'What happens if the marketplace shuts down — do I lose my NFT?',
    answer:
      'No! Your digital assets live permanently on the Ethereum blockchain, not on our website servers. Even if PUFF Marketplace were to go offline completely, your NFTs remain safely in your personal crypto wallet. You can view, transfer, or trade them on any compatible block explorer or alternative Ethereum platform.',
  },
  {
    category: 'Security & Ownership',
    question: 'Can the marketplace freeze, delete, or take my NFT?',
    answer:
      'No. Because ownership is governed by non-custodial smart contracts on Ethereum, no administrator, server operator, or central entity can freeze, alter, or transfer an asset out of your wallet. Only you, using your secret wallet signature, can authorize a transaction.',
  },
  {
    category: 'Payments & Gas',
    question: 'How does the ERC-20 Dual-Mode Buy process work (Permit vs Approval)?',
    answer:
      'PUFF Marketplace supports two payment modes when purchasing items with PUFF coin:\n\n1. Mode A — Gasless Permit (EIP-2612): You sign a zero-gas off-chain authorization message. The marketplace contract executes the approval and purchase in a single atomic transaction, saving gas fees!\n\n2. Mode B — Standard Approval: You submit a 1st transaction to approve the token allowance, followed by a 2nd transaction to execute the purchase.',
  },
  {
    category: 'Royalties',
    question: 'How do Creator Royalties work and what is their current status?',
    answer:
      'The platform architecture includes support for the official EIP-2981 Creator Royalty standard, which automatically routes 5% of secondary sales directly to the original artist. Note: The Royalty engine is currently tagged as "Coming Soon / Roadmap" while baseline protocol trades operate with a 97.5% seller / 2.5% treasury split.',
  },
  {
    category: 'Wallets & Access',
    question: 'What wallets are supported?',
    answer:
      'You can connect using any major Web3 wallet via RainbowKit, including MetaMask, Coinbase Wallet, Trust Wallet, Rainbow, and hundreds of mobile wallets through WalletConnect.',
  },
  {
    category: 'Faucet & Utility',
    question: 'What is PUFF coin and how do I get it for testing?',
    answer:
      'PUFF coin is the ERC-20 utility token powering all trades, listings, and auctions on the Sepolia network. New users can claim free tokens directly from the built-in Faucet in the top header: 5,000 PUFF welcome bonus plus 1,000 PUFF daily claim every 24 hours.',
  },
  {
    category: 'Auctions',
    question: 'How do Auctions work and what prevents last-second bot sniping?',
    answer:
      'Sellers can set timed auctions from 1 hour to 7 days with a minimum starting bid. Bids require at least a 5% step increase. To prevent automated bots from "sniping" items in the final millisecond, any bid placed in the final 10 minutes automatically extends the auction clock by an additional 10 minutes!',
  },
  {
    category: 'Gas Savings',
    question: 'Can I launch my own custom NFT collection without paying high gas fees?',
    answer:
      'Yes! Traditional collection contracts cost over $50–$100 in network deployment fees. PUFF Marketplace utilizes an ERC-1167 Minimal Proxy Factory pattern. When you launch a collection, the factory deploys a lightweight contract clone, saving 90%–95% on gas fees!',
  },
  {
    category: 'Refunds & Escrow',
    question: 'What happens if I am outbid in an auction?',
    answer:
      'If another collector outbids you, your PUFF coins are immediately released from escrow into your secure personal vault compartment (using a non-custodial pull-payment pattern). You can click "Withdraw Refund" at any time to return those coins to your active wallet.',
  },
  {
    category: 'Verification',
    question: 'How can I verify contract code and transaction history on Etherscan?',
    answer:
      'All 4 core smart contracts (PUFF Token, PUFF NFT, Marketplace, and Auction) are published and verified on Sepolia Etherscan. Simply copy any transaction hash or contract address and paste it into sepolia.etherscan.io to review verified Solidity code, block timestamps, and exact token transfers.',
  },
];

interface GlossaryTerm {
  term: string;
  definition: string;
  tag: string;
}

const GLOSSARY: GlossaryTerm[] = [
  {
    term: 'EIP-2612 (Permit)',
    definition: 'An ERC-20 extension that allows gasless approvals using structured EIP-712 off-chain signatures, replacing separate approval transactions.',
    tag: 'Token Standard',
  },
  {
    term: 'Minimal Proxy (ERC-1167)',
    definition: 'A lightweight smart contract clone pattern that delegates all call logic to a master implementation, cutting deployment costs by up to 95%.',
    tag: 'Gas Optimization',
  },
  {
    term: 'Atomic Swap',
    definition: 'A smart contract operation where token payment transfer and NFT ownership transfer happen simultaneously in a single transaction or revert completely if failed.',
    tag: 'Smart Contract',
  },
  {
    term: 'IPFS (InterPlanetary File System)',
    definition: 'A peer-to-peer decentralized storage network that addresses files by cryptographic hashes (CIDs) rather than server locations.',
    tag: 'Storage',
  },
  {
    term: 'Anti-Sniping Extension',
    definition: 'An automated auction rule that extends the timer by 10 minutes whenever a new bid arrives in the final 10 minutes of an auction.',
    tag: 'Auction Mechanism',
  },
  {
    term: 'Pull Payment Vault',
    definition: 'A non-custodial design pattern where funds or refunds are held in individual user vault balances for manual withdrawal, preventing reentrancy attacks.',
    tag: 'Security Pattern',
  },
  {
    term: 'Nonce',
    definition: 'A random or sequential counter used in wallet signatures to prevent replay attacks and ensure every message can only be processed once.',
    tag: 'Cryptography',
  },
  {
    term: 'ERC-721',
    definition: 'The standard Ethereum interface for non-fungible tokens, ensuring each item has a unique ID and verifiable owner.',
    tag: 'NFT Standard',
  },
  {
    term: 'ERC-20',
    definition: 'The standard Ethereum interface for fungible utility tokens, powering PUFF coin balances and marketplace transfers.',
    tag: 'Token Standard',
  },
  {
    term: 'EIP-2981 (Royalty Standard)',
    definition: 'A standardized interface allowing NFT contracts to specify royalty percentage (e.g. 5%) and creator payout address for secondary sales.',
    tag: 'NFT Standard',
  },
  {
    term: 'Gas Fee',
    definition: 'Small computational fee paid in network currency (ETH) to validators for processing transactions on the Ethereum network.',
    tag: 'Blockchain Core',
  },
  {
    term: 'Sepolia Testnet',
    definition: 'The primary Ethereum test network where PUFF smart contracts are deployed and verified for realistic testing with zero real money risk.',
    tag: 'Network',
  },
  {
    term: 'Content Identifier (CID)',
    definition: 'A unique cryptographic fingerprint assigned to every file uploaded to IPFS, ensuring permanent tamper-proof file integrity.',
    tag: 'Storage',
  },
  {
    term: 'Event Listener / Indexer',
    definition: 'A background service that continuously monitors blockchain block headers for contract events (Mint, List, Bid, Sale) to update local database state.',
    tag: 'Backend Architecture',
  },
  {
    term: 'WebSockets (Socket.IO)',
    definition: 'A real-time bidirectional communication channel used to push auction updates and toast alerts to connected browsers without refreshing.',
    tag: 'Real-Time Sync',
  },
  {
    term: 'JSON Web Token (JWT)',
    definition: 'A signed session token issued after wallet signature verification, granting access to private profile updating endpoints.',
    tag: 'Authentication',
  },
  {
    term: 'Prisma ORM',
    definition: 'A next-generation TypeScript database client used to query PostgreSQL tables for fast marketplace search and activity sorting.',
    tag: 'Database Layer',
  },
  {
    term: 'RainbowKit',
    definition: 'A polished React library for managing wallet connections, network switching, and account modal UI.',
    tag: 'Frontend Library',
  },
  {
    term: 'Escrow Vault',
    definition: 'A smart contract state where an NFT or bid amount is locked safely during an active auction until final settlement.',
    tag: 'Smart Contract',
  },
  {
    term: 'Circuit Breaker / Pause',
    definition: 'An emergency administrative control built into smart contracts to pause trading in case of network threats.',
    tag: 'Security Feature',
  },
];

export default function ArchitecturePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'flow' | 'payment' | 'data' | 'calculator' | 'security' | 'faq'>('overview');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedFlowStep, setSelectedFlowStep] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'permit' | 'approve'>('permit');
  const [calcPrice, setCalcPrice] = useState<number>(10000);
  const [matrixFilter, setMatrixFilter] = useState<'All' | 'On-Chain' | 'IPFS' | 'Database'>('All');
  const [faqSearch, setFaqSearch] = useState<string>('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [glossarySearch, setGlossarySearch] = useState<string>('');

  // Fee calculation logic
  const sellerPercentage = 97.5;
  const treasuryPercentage = 2.5;
  const royaltyPercentage = 5.0; // Roadmap feature

  const sellerAmount = (calcPrice * sellerPercentage) / 100;
  const treasuryAmount = (calcPrice * treasuryPercentage) / 100;
  const royaltyAmount = (calcPrice * royaltyPercentage) / 100;

  // Filtered FAQ items
  const filteredFaqs = useMemo(() => {
    if (!faqSearch.trim()) return FAQS;
    const q = faqSearch.toLowerCase();
    return FAQS.filter(
      (item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  // Filtered Glossary terms
  const filteredGlossary = useMemo(() => {
    if (!glossarySearch.trim()) return GLOSSARY;
    const q = glossarySearch.toLowerCase();
    return GLOSSARY.filter(
      (item) => item.term.toLowerCase().includes(q) || item.definition.toLowerCase().includes(q) || item.tag.toLowerCase().includes(q)
    );
  }, [glossarySearch]);

  // Filtered Data Matrix
  const filteredMatrix = useMemo(() => {
    if (matrixFilter === 'All') return DATA_MATRIX;
    return DATA_MATRIX.filter((item) => item.location === matrixFilter);
  }, [matrixFilter]);

  const flowSteps = [
    {
      title: '1. Wallet Auth & Signature',
      subtitle: 'Zero-gas cryptographic handshake',
      detail: 'Client requests nonce from server. User signs temporary phrase in wallet. Server verifies public key & issues a 7-day JWT session token.',
      icon: <FaKey className="text-yellow-400" />,
      tag: 'Security & Auth',
    },
    {
      title: '2. Media Upload & Minting',
      subtitle: 'IPFS Pinning & ERC-721 Mint',
      detail: 'Artwork/video is uploaded to Pinata IPFS. Thumbnail is auto-extracted. Standardized JSON metadata CID is minted on Sepolia as a new ERC-721 token.',
      icon: <FaCube className="text-blue-400" />,
      tag: 'Decentralized Storage',
    },
    {
      title: '3. Fixed Sale or Timed Auction',
      subtitle: 'Non-Custodial Listing & Escrow',
      detail: 'Seller signs a listing request or locks the NFT into the Auction Vault contract. Bidders submit PUFF coins into escrow with anti-sniping protection.',
      icon: <FaExchangeAlt className="text-purple-400" />,
      tag: 'Smart Contract',
    },
    {
      title: '4. Atomic Purchase & Settlement',
      subtitle: 'Dual ERC-20 Payment Modes',
      detail: 'Buyer purchases using either Gasless Permit (EIP-2612) or Standard Approval. Funds are split atomically: 97.5% to Seller, 2.5% to Treasury.',
      icon: <FaCoins className="text-emerald-400" />,
      tag: 'Atomic Swap',
    },
    {
      title: '5. Real-Time Indexer & Toasts',
      subtitle: 'WebSockets & PostgreSQL Cache',
      detail: 'Event listener detects contract log on Sepolia block header, updates local read database, and broadcasts instant Socket.IO updates to connected browsers.',
      icon: <FaNetworkWired className="text-rose-400" />,
      tag: 'Real-Time Sync',
    },
  ];

  return (
    <div className="relative z-10 w-full min-h-screen selection:bg-blue-600/35 selection:text-white pb-20">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-96 right-1/4 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 relative z-10 space-y-10">

        {/* Hero Header Section */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider shadow-inner">
            <HiSparkles className="w-4 h-4 text-blue-400 animate-pulse" />
            Platform Architecture & Whitepaper
          </div>
          <h1 className={`${statliche.className} text-4xl sm:text-6xl font-light tracking-wide bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent`}>
            PUFF MARKET SYSTEM BLUEPRINT
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Explore the technical decisions, smart contract flows, decentralized storage model, real-time event indexing, and gas optimization strategies powering PUFF Marketplace.
          </p>

          {/* Metric Highlights Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-left">
            <div className="bg-[#111318]/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-xs text-gray-400 font-medium">Network</div>
              <div className="text-lg font-bold text-white flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Sepolia EVM
              </div>
              <div className="text-[10px] text-emerald-400/90 mt-1 font-mono">100% Contract Verified</div>
            </div>

            <div className="bg-[#111318]/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-xs text-gray-400 font-medium">Payment Mode</div>
              <div className="text-lg font-bold text-purple-400 flex items-center gap-1.5 mt-0.5">
                <FaBolt className="text-purple-400 w-4 h-4" />
                EIP-2612 Permit
              </div>
              <div className="text-[10px] text-purple-300/80 mt-1">Gasless 1-Step Approval</div>
            </div>

            <div className="bg-[#111318]/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-xs text-gray-400 font-medium">Factory Savings</div>
              <div className="text-lg font-bold text-amber-400 flex items-center gap-1.5 mt-0.5">
                <FaCoins className="text-amber-400 w-4 h-4" />
                90% – 95% Less Gas
              </div>
              <div className="text-[10px] text-amber-300/80 mt-1">ERC-1167 Minimal Proxy</div>
            </div>

            <div className="bg-[#111318]/80 border border-zinc-800/80 rounded-2xl p-4 backdrop-blur-md">
              <div className="text-xs text-gray-400 font-medium">Storage Integrity</div>
              <div className="text-lg font-bold text-cyan-400 flex items-center gap-1.5 mt-0.5">
                <FaCube className="text-cyan-400 w-4 h-4" />
                Pinata IPFS
              </div>
              <div className="text-[10px] text-cyan-300/80 mt-1">100% Content Addressed</div>
            </div>
          </div>
        </div>

        {/* Interactive Tab Navigation Bar */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto gap-2 p-1.5 bg-[#0c0d12]/90 border border-zinc-800/80 rounded-2xl backdrop-blur-xl shadow-xl scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaLayerGroup /> Architecture Layers
          </button>

          <button
            onClick={() => setActiveTab('flow')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'flow'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaHistory /> App Lifecycle
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <HiOutlineSwitchHorizontal className="w-4 h-4" /> Dual Payment Modes
          </button>

          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'data'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaDatabase /> Data Placement Matrix
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaSlidersH /> Fee Split Simulator
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'security'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaShieldAlt /> Security & Audit
          </button>

          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FaQuestionCircle /> FAQ & Glossary
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: ARCHITECTURE OVERVIEW & TECH STACK CARDS */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Interactive System Architecture Diagram */}
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaLayerGroup className="text-blue-400" />
                    4-Layer Platform Topology
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Click any layer below to inspect component responsibilities and data flow paths.
                  </p>
                </div>
                <div className="text-xs text-gray-400 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-lg font-mono">
                  Single Source of Truth: <span className="text-emerald-400 font-bold">Ethereum Blockchain</span>
                </div>
              </div>

              {/* 4 Interactive Layer Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Layer 1: Client UI */}
                <div
                  onClick={() => setSelectedLayer(selectedLayer === 1 ? null : 1)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLayer === 1
                      ? 'bg-blue-500/10 border-blue-500/60 shadow-lg shadow-blue-500/10 ring-2 ring-blue-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      LAYER 1
                    </span>
                    <FaBolt className="text-blue-400" />
                  </div>
                  <h3 className="font-bold text-white text-base">Client Application</h3>
                  <p className="text-xs text-gray-400 mt-1">Next.js 14, RainbowKit, Wagmi, Ethers v6</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-gray-300">
                    Renders UI, collects wallet signatures, displays real-time auction timers.
                  </div>
                </div>

                {/* Layer 2: Smart Contracts */}
                <div
                  onClick={() => setSelectedLayer(selectedLayer === 2 ? null : 2)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLayer === 2
                      ? 'bg-purple-500/10 border-purple-500/60 shadow-lg shadow-purple-500/10 ring-2 ring-purple-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                      LAYER 2
                    </span>
                    <FaLock className="text-purple-400" />
                  </div>
                  <h3 className="font-bold text-white text-base">EVM Smart Contracts</h3>
                  <p className="text-xs text-gray-400 mt-1">PUFF ERC-20, NFT ERC-721, Marketplace, Vault</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-gray-300">
                    Enforces non-custodial atomic swaps, auction escrow & EIP-2612 Permit.
                  </div>
                </div>

                {/* Layer 3: Decentralized Storage */}
                <div
                  onClick={() => setSelectedLayer(selectedLayer === 3 ? null : 3)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLayer === 3
                      ? 'bg-cyan-500/10 border-cyan-500/60 shadow-lg shadow-cyan-500/10 ring-2 ring-cyan-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                      LAYER 3
                    </span>
                    <FaCube className="text-cyan-400" />
                  </div>
                  <h3 className="font-bold text-white text-base">IPFS P2P Storage</h3>
                  <p className="text-xs text-gray-400 mt-1">Pinata IPFS, Media CIDs, Video Previews</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-gray-300">
                    Stores permanent artwork, MP4 video streams & ERC-721 metadata JSON.
                  </div>
                </div>

                {/* Layer 4: Real-Time Indexer */}
                <div
                  onClick={() => setSelectedLayer(selectedLayer === 4 ? null : 4)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    selectedLayer === 4
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/30'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      LAYER 4
                    </span>
                    <FaNetworkWired className="text-amber-400" />
                  </div>
                  <h3 className="font-bold text-white text-base">Real-Time Indexer</h3>
                  <p className="text-xs text-gray-400 mt-1">Node.js, Socket.IO, Prisma & PostgreSQL</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-gray-300">
                    Monitors block events 24/7, updates read cache & pushes websocket toasts.
                  </div>
                </div>
              </div>

              {/* Dynamic Layer Deep-Dive Info */}
              {selectedLayer && (
                <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-2xl text-xs space-y-2 animate-fadeIn">
                  <div className="font-bold text-white flex items-center gap-2">
                    <FaInfoCircle className="text-blue-400" />
                    Layer {selectedLayer} Technical Rationale:
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {selectedLayer === 1 &&
                      'The frontend uses React 18 with Wagmi hooks to ensure transparent wallet management. All read actions poll RPC nodes directly, while user interactions prompt clear signature verification.'}
                    {selectedLayer === 2 &&
                      'Smart contracts are compiled with Solidity 0.8+ featuring built-in arithmetic protection. Standardized ERC interfaces (ERC-20, ERC-721, EIP-2612) ensure interoperability across Ethereum block explorers and third-party tools.'}
                    {selectedLayer === 3 &&
                      'By decoupling heavy media storage from blockchain transactions, file storage costs drop to zero on-chain while preserving 100% cryptographic permanence via content-addressed CIDs.'}
                    {selectedLayer === 4 &&
                      'The Node.js event listener acts strictly as a read-only cache and web-socket proxy. It indexes block logs into PostgreSQL for instant UI search without replacing Ethereum as the single source of truth.'}
                  </p>
                </div>
              )}
            </div>

            {/* Tech Stack Choices Grid */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-xl font-bold text-white">Technology Stack & Technical Rationale</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Every dependency was chosen for speed, security, standard compliance, and developer auditability.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {TECH_STACK.map((tech, idx) => (
                  <div
                    key={idx}
                    className="bg-[#111319]/80 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border bg-gradient-to-r ${tech.color}`}>
                          {tech.badge}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">{tech.category}</span>
                      </div>
                      <h3 className="font-bold text-white text-sm">{tech.name}</h3>
                      <p className="text-xs text-gray-400 leading-relaxed">{tech.role}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-800/60 text-[11px] text-gray-300 italic">
                      💡 {tech.rationale}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: APPLICATION LIFECYCLE & STEP-BY-STEP FLOW */}
        {/* ========================================================================= */}
        {activeTab === 'flow' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaHistory className="text-blue-400" />
                  Interactive Application Flowchart
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Click through the steps below to trace an asset from initial wallet signature to final real-time event indexing.
                </p>
              </div>

              {/* Step Navigation Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {flowSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFlowStep(idx)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedFlowStep === idx
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-lg ring-1 ring-blue-500/50'
                        : 'bg-zinc-900/40 border-zinc-800 text-gray-400 hover:bg-zinc-900/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-blue-400">STEP 0{idx + 1}</span>
                      {step.icon}
                    </div>
                    <div className="text-xs font-bold truncate">{step.title.split('.')[1]}</div>
                    <div className="text-[10px] text-gray-400 mt-1 truncate">{step.tag}</div>
                  </button>
                ))}
              </div>

              {/* Step Detail Focus Card */}
              <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-2xl space-y-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-lg">
                    {flowSteps[selectedFlowStep].icon}
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider">
                      {flowSteps[selectedFlowStep].tag}
                    </span>
                    <h3 className="text-lg font-bold text-white">{flowSteps[selectedFlowStep].title}</h3>
                    <p className="text-xs text-gray-400">{flowSteps[selectedFlowStep].subtitle}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-200 leading-relaxed pt-2 border-t border-zinc-800">
                  {flowSteps[selectedFlowStep].detail}
                </p>

                {/* Additional Step Context Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
                    <span className="font-bold text-blue-400 block mb-1">🔒 Security Guarantee</span>
                    {selectedFlowStep === 0 && 'Private keys never leave wallet. Signatures use EIP-4361 domain binding.'}
                    {selectedFlowStep === 1 && 'IPFS CIDs ensure media can never be altered or replaced post-mint.'}
                    {selectedFlowStep === 2 && 'NFTs are locked safely inside smart contract escrow during live auctions.'}
                    {selectedFlowStep === 3 && 'Atomic swap guarantees payment and token transfer occur in one step or revert.'}
                    {selectedFlowStep === 4 && 'Database acts purely as a read-only cache. On-chain state rules absolute.'}
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs">
                    <span className="font-bold text-amber-400 block mb-1">⚡ Gas Efficiency</span>
                    {selectedFlowStep === 0 && '0 ETH / 0 Gas cost for off-chain message signing.'}
                    {selectedFlowStep === 1 && 'Metadata JSON pinned off-chain; tokenURI stores short IPFS hash.'}
                    {selectedFlowStep === 2 && 'Minimal Proxy clones reduce collection deployment costs by 90-95%.'}
                    {selectedFlowStep === 3 && 'Permit (EIP-2612) saves gas by bundling approval & transfer into 1 TX.'}
                    {selectedFlowStep === 4 && 'Background indexer eliminates expensive on-chain view query loops.'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DUAL-MODE ERC-20 PAYMENT EXPLORER (PERMIT VS APPROVE) */}
        {/* ========================================================================= */}
        {activeTab === 'payment' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold mb-2">
                    <HiOutlineSwitchHorizontal /> Architecture Highlight
                  </div>
                  <h2 className="text-xl font-bold text-white">ERC-20 Dual Payment Mode Explorer</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Compare how PUFF Marketplace supports both gasless EIP-2612 Permit signatures and traditional 2-step approvals.
                  </p>
                </div>

                {/* Mode Selector Toggle Switch */}
                <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  <button
                    onClick={() => setPaymentMode('permit')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentMode === 'permit'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    ⚡ Mode A: Gasless Permit (EIP-2612)
                  </button>
                  <button
                    onClick={() => setPaymentMode('approve')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      paymentMode === 'approve'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    🔄 Mode B: Standard Approval
                  </button>
                </div>
              </div>

              {/* Dual Mode Comparison Visualizer */}
              {paymentMode === 'permit' ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-purple-300 flex items-center gap-2">
                        <FaBolt className="text-purple-400" />
                        Mode A: Gasless Permit (EIP-2612 Signature) — Recommended
                      </h3>
                      <span className="text-xs font-mono font-bold bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                        1 On-Chain Transaction Total
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      EIP-2612 permits allow users to sign an off-chain authorization message (EIP-712 structured data) containing token amount, spender address, deadline, and nonce. The marketplace contract verifies the signature on-chain and transfers tokens in a single atomic transaction!
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="text-xs font-bold text-purple-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px] text-purple-300">
                            1
                          </span>
                          Off-Chain Permit Signature (0 Gas)
                        </div>
                        <p className="text-[11px] text-gray-400">
                          User signs structured message in wallet (MetaMask / RainbowKit). No network gas fee is spent!
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-300">
                            2
                          </span>
                          Atomic Purchase Execution (1 TX)
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Marketplace contract verifies permit, approves allowance, transfers PUFF coins, and delivers NFT instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 animate-fadeIn">
                  <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-blue-300 flex items-center gap-2">
                        <FaExchangeAlt className="text-blue-400" />
                        Mode B: Legacy Approval + TransferFrom Pattern
                      </h3>
                      <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                        2 On-Chain Transactions Total
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Fallback mode for standard wallets or legacy tokens. Requires the user to broadcast an initial approval transaction to authorize the contract, followed by a separate purchase transaction.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="text-xs font-bold text-blue-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-300">
                            1
                          </span>
                          Approve Transaction (TX 1)
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Broadcasts <code className="text-blue-300">approve(marketplace, amount)</code> to Ethereum. Waits for block confirmation.
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-300">
                            2
                          </span>
                          Purchase Execution (TX 2)
                        </div>
                        <p className="text-[11px] text-gray-400">
                          Broadcasts <code className="text-emerald-300">buyItem(listingId)</code> to execute the atomic token and NFT transfer.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DATA PLACEMENT MATRIX (WHERE DATA LIVES) */}
        {/* ========================================================================= */}
        {activeTab === 'data' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaDatabase className="text-cyan-400" />
                    Data Placement Matrix
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Transparent breakdown of where media assets, ownership records, token balances, and user profiles are stored.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  {(['All', 'On-Chain', 'IPFS', 'Database'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setMatrixFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        matrixFilter === filter
                          ? 'bg-cyan-600 text-white shadow-md'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Placement Table Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatrix.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-white text-sm">{item.asset}</h3>
                      <span
                        className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
                          item.location === 'On-Chain'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : item.location === 'IPFS'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {item.location}
                      </span>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">{item.reason}</p>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                      <span>Security Standard</span>
                      <span className="text-emerald-400">{item.immutability}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: FEE & ROYALTY SPLIT CALCULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'calculator' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-8">
              <div className="border-b border-zinc-800/80 pb-6">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-2">
                  <FaSlidersH /> Interactive Simulator
                </div>
                <h2 className="text-xl font-bold text-white">Atomic Settlement & Royalty Calculator</h2>
                <p className="text-xs text-gray-400 mt-1">
                  Adjust the item price slider below to test exact atomic payment distribution for any NFT transaction.
                </p>
              </div>

              {/* Slider Input Controls */}
              <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-white flex items-center gap-2">
                    <FaCoins className="text-amber-400" />
                    Simulated NFT Sale Price:
                  </label>
                  <div className="text-lg font-black text-amber-400 font-mono bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-xl">
                    {calcPrice.toLocaleString()} PUFF
                  </div>
                </div>

                <input
                  type="range"
                  min="100"
                  max="100000"
                  step="500"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>100 PUFF</span>
                  <span>50,000 PUFF</span>
                  <span>100,000 PUFF</span>
                </div>
              </div>

              {/* Output Split Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Seller Proceeds */}
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Seller Proceeds</span>
                    <span className="text-xs font-bold font-mono text-emerald-300">97.5%</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{sellerAmount.toLocaleString()} PUFF</div>
                  <p className="text-[11px] text-gray-400">Directly credited to the seller address upon atomic purchase completion.</p>
                </div>

                {/* Card 2: Platform Treasury */}
                <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Treasury Protocol Fee</span>
                    <span className="text-xs font-bold font-mono text-blue-300">2.5%</span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{treasuryAmount.toLocaleString()} PUFF</div>
                  <p className="text-[11px] text-gray-400">Routes to marketplace contract vault to support infrastructure & liquidity.</p>
                </div>

                {/* Card 3: Creator Royalty (Roadmap) */}
                <div className="p-5 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2 relative overflow-hidden">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Creator Royalty (EIP-2981)</span>
                    <span className="text-[10px] font-extrabold font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-400/40 animate-pulse">
                      COMING SOON
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono">{royaltyAmount.toLocaleString()} PUFF</div>
                  <p className="text-[11px] text-gray-400">
                    Roadmap feature: Automated 5% secondary sale royalty cut routed directly to original creator wallet.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: SECURITY & ETHERSCAN VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FaShieldAlt className="text-amber-400" />
                  Security Principles & Verification Guide
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Built on non-custodial zero-trust principles. Verify everything independently on Ethereum block explorers.
                </p>
              </div>

              {/* 3 Security Pillars Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg">
                    <FaLock />
                  </div>
                  <h3 className="font-bold text-white text-base">Non-Custodial Architecture</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    The platform never holds your private keys or takes ownership of your wallet funds. Assets are swapped atomically in real-time.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-lg">
                    <FaClock />
                  </div>
                  <h3 className="font-bold text-white text-base">Anti-Sniping Safeguard</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Any auction bid placed in the final 10 minutes automatically extends the timer by 10 minutes, defeating automated bot sniping.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-lg">
                    <FaShieldAlt />
                  </div>
                  <h3 className="font-bold text-white text-base">Pull-Payment Vault Pattern</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Auction refunds and outbid claims are isolated in safe individual vaults for manual withdrawal, protecting contracts from reentrancy.
                  </p>
                </div>
              </div>

              {/* 3-Step Etherscan Verification Banner */}
              <div className="p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FaExternalLinkAlt className="text-blue-400" />
                  How to Verify Any Transaction on Etherscan in 3 Steps:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="font-mono font-bold text-blue-400 block mb-1">STEP 1</span>
                    Copy your wallet address or any transaction hash link displayed on your profile or item detail page.
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="font-mono font-bold text-purple-400 block mb-1">STEP 2</span>
                    Open{' '}
                    <a
                      href="https://sepolia.etherscan.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 underline hover:text-blue-300"
                    >
                      sepolia.etherscan.io
                    </a>{' '}
                    in your web browser.
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="font-mono font-bold text-emerald-400 block mb-1">STEP 3</span>
                    Paste the code into the Etherscan search bar to inspect verified block receipts, token transfers, and Solidity source code!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: SEARCHABLE FAQ & WEB3 GLOSSARY */}
        {/* ========================================================================= */}
        {activeTab === 'faq' && (
          <div className="space-y-10 animate-fadeIn">
            {/* Searchable FAQ Accordion */}
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaQuestionCircle className="text-rose-400" />
                    Frequently Asked Questions
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Everything you need to know about ownership, security, gas fees, and token utility.
                  </p>
                </div>

                {/* FAQ Search Bar */}
                <div className="relative w-full sm:w-72">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search whitepaper FAQs..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500/50"
                  />
                </div>
              </div>

              {/* FAQ Accordion List */}
              <div className="space-y-3">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-zinc-800/80 rounded-2xl bg-zinc-900/40 overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full p-4 text-left flex justify-between items-center gap-4 hover:bg-zinc-800/30 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-white text-sm flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-gray-400">
                            {faq.category}
                          </span>
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <FaChevronUp className="text-rose-400 text-xs flex-shrink-0" />
                        ) : (
                          <FaChevronDown className="text-gray-500 text-xs flex-shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="p-4 pt-2 border-t border-zinc-800/60 text-xs text-gray-300 leading-relaxed whitespace-pre-line bg-zinc-950/50">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Searchable Web3 Technical Glossary */}
            <div className="bg-[#111319]/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/80 pb-6">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FaBook className="text-blue-400" />
                    Web3 Technical Glossary
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Key terminology, standards, and concepts used across the PUFF marketplace ecosystem.
                  </p>
                </div>

                {/* Glossary Search Bar */}
                <div className="relative w-full sm:w-72">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs" />
                  <input
                    type="text"
                    placeholder="Search Web3 terms..."
                    value={glossarySearch}
                    onChange={(e) => setGlossarySearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              {/* Glossary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGlossary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-white text-sm">{item.term}</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {item.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed">{item.definition}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
