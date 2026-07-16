'use client';

import { useWallet } from '@/contexts/WalletProvider';
import walletImg from '../../assets/wallet.png'
import Image from 'next/image';
import { Staatliches, Outfit } from 'next/font/google'
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
                        className={`bg-gray1 px-4 py-2 hover:bg-gray3 cursor-pointer rounded-md text-lg text-center flex items-center`}
                    >
                        <div className='flex items-center gap-1 bg-transparent mr-4'>
                            <Image src={walletImg} className='w-4 h-4' alt="wallet" />
                            <p className={`bg-transparent`}>{account?.slice(0, 6)}...</p>
                        </div>
                        Disconnect
                    </button>
                </div>
            ) : (
                <div>
                    <button
                        onClick={connectWallet}
                        className={`bg-gray1 px-4 py-2 hover:bg-gray3 cursor-pointer rounded-md text-lg text-center flex items-center`}
                    >
                        <Image src={walletImg} className='w-4 h-4 mr-2' alt="wallet" />
                        Connect Wallet
                    </button>
                </div>
            )}
        </div>
    );
};

export default ConnectWalletButton;