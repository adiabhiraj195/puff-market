'use client';

import { useWallet } from '@/contexts/WalletProvider';
import walletImg from '@/components/assets/wallet.png'
import Image from 'next/image';
import { Staatliches, Outfit } from '@/lib/fonts'
import { useEffect } from 'react';

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

const ConnectWalletButton: React.FC = () => {
    const { account, connectWallet, disconnectWallet, isConnected } = useWallet();


    return (
        <div>
            {isConnected ? (
                <div className='flex items-center gap-2'>
                    <button
                        onClick={disconnectWallet}
                        className={`bg-zinc-900/60 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700/80 text-zinc-200 px-4 py-1.5 cursor-pointer rounded-full text-sm font-medium flex items-center transition-all duration-200 active:scale-95 shadow-md backdrop-blur-md`}
                    >
                        <div className='flex items-center gap-1.5 bg-transparent mr-3'>
                            <Image src={walletImg} className='w-4 h-4 object-contain filter invert opacity-85' alt="wallet" />
                            <span className="font-mono text-zinc-400">{account?.slice(0, 6)}...{account?.slice(-4)}</span>
                        </div>
                        Disconnect
                    </button>
                </div>
            ) : (
                <div>
                    <button
                        onClick={connectWallet}
                        className={`bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2 cursor-pointer rounded-full text-sm font-bold flex items-center transition-all duration-200 active:scale-95 shadow-md shadow-blue-500/15 hover:shadow-lg hover:shadow-blue-500/25`}
                    >
                        <Image src={walletImg} className='w-4 h-4 mr-2 object-contain filter brightness-0 invert' alt="wallet" />
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConnectWalletButton;