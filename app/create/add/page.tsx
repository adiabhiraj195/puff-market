"use client"

import { useEffect, useState } from "react";
import { Staatliches } from "@next/font/google";
import AddNewNftForm from '@/components/add-new-nft-form';
import { useWallet } from "@/contexts/WalletProvide";
import Loading from "@/components/ui/Loading";
import { getUserNfts } from "@/api/nft";

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

export default function AddNftPage() {
    const { isConnected } = useWallet();
    const [listedNft, setListedNft] = useState<any[] | undefined>(undefined);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUserNfts = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            setLoading(true);
            try {
                const data = await getUserNfts();
                setListedNft(data);
            } catch (err) {
                console.error("Error fetching user NFTs:", err);
            } finally {
                setLoading(false);
            }
        };

        if (isConnected) {
            fetchUserNfts();
        } else {
            setListedNft(undefined);
        }
    }, [isConnected]);

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-screen text-gray-400 gap-4">
                <h2 className="text-2xl font-bold text-white">Unauthorised</h2>
                <p>Please connect your wallet to view and add your NFTs.</p>
            </div>
        );
    }

    return (
        <div className="container flex justify-center items-center h-screen relative text-white">
            {loading && <Loading />}
            <div className=' h-full'>
                {listedNft === undefined || listedNft.length === 0 ?
                    <div className='flex items-start'>
                        <p className='font-bold text-lg my-5'>No NFT is Listed! Yet</p>
                    </div> :
                    <div>
                        {listedNft.map((nft: any, index) => (
                            <div className='my-2 rounded-md overflow-hidden' key={index}>
                                <img src={nft.imageURI} className='w-full' alt="user's asset nft"></img>
                            </div>
                        ))}
                    </div>
                }
            </div>
            <div className='flex justify-center items-center h-screen -top-8 fixed m-8 w-full bg-[#00000033]'>
                <h1 className={`${statliche.className} text-4xl flex flex-col m-4`}>
                    <span className='my-4'>Add</span>
                    <span className='my-4'>Your</span>
                    <span className='my-4'>NFT</span>
                </h1>
                <AddNewNftForm />
            </div>
        </div >
    );
}