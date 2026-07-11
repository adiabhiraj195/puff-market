import NFTCard from '@/components/ui/nft-card'
import WithdrawEth from '@/components/Money-withdraw';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getUserNfts } from "@/api/nft";

export default async function Page() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let data: any[] | null = null;
    let errorMsg = "";
    if (token) {
        try {
            data = await getUserNfts(token);
        } catch (e: any) {
            console.error("Failed to fetch user NFTs:", e);
            if (e.response?.status === 401) {
                errorMsg = "Unauthorised";
            } else {
                errorMsg = "Failed to load data";
            }
        }
    }

    if (!token || errorMsg === "Unauthorised") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 gap-4">
                <h2 className="text-2xl font-bold text-white">Unauthorised</h2>
                <p>Please connect your wallet to access your profile.</p>
            </div>
        )
    }

    return (
        <div className='w-full h-full px-8'>
            {(data && data?.length > 0) ?
                <div className='flex'>
                    {data?.map((item: any) => {
                        return (
                            <Link href={`/account/${item.id}`} key={item.id} className='my-2 mx-3'>
                                <NFTCard
                                    tokenId={item.tokenId}
                                    imageUrl={item.imageURI}
                                />
                            </Link>
                        )
                    })}
                </div> :
                <h1 className='flex justify-center font-bold text-lg my-3 h-full'>
                    You haven&apos;t added any NFT yet
                </h1>
            }
            <WithdrawEth />
        </div>
    )
}

