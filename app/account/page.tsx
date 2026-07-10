import NFTCard from '@/components/ui/nft-card'
import { getAllNftOfUser } from '@/data-access/nft';
import WithdrawEth from '@/components/Money-withdraw';
import Link from 'next/link';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export default async function Page() {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    let user: { id: string; address: string } | null = null;
    if (token) {
        try {
            const jwtSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_JWT_SECRET || "default_secret";
            user = jwt.verify(token, jwtSecret) as { id: string; address: string };
        } catch (e) {
            console.error("JWT verification failed in account page:", e);
        }
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-gray-400 gap-4">
                <h2 className="text-2xl font-bold text-white">Unauthorised</h2>
                <p>Please connect your wallet to access your profile.</p>
            </div>
        )
    }

    const data = await getAllNftOfUser(user.id);
    // console.log(data)
    return (
        <div className='w-full h-full px-8'>
            {(data && data?.length > 0) ?
                <div className='flex'>
                    {data?.map((item: any) => {
                        return (
                            <Link href={`/account/${item.id}`} key={item.id} className='my-2 mx-3'>
                                <NFTCard
                                    tokenId={item.tokenId}
                                    // seller={item.ownerId}
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

