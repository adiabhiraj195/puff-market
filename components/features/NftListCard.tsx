import Link from "next/link";
import React from "react";

interface Interface {
    id: string;
    rank: number;
    logo: string;
    tokenId: string;
    price: string;
    seller: string;
}

export default function NftListCard({
    id,
    rank,
    logo,
    tokenId,
    price,
    seller
}: Interface) {
    return (
        <tr key={rank} className="border-b border-gray-800 hover:bg-gray3 cursor-pointer rounded-xl">
            <td className="py-3 px-4">{rank}</td>
            <td className="py-3 px-4 w-20 h-20 flex items-center bg-cover">
                <Link href={`/nft/${id}`} className="h-full w-full flex items-center hover:underline">
                    <img
                        src={logo}
                        alt={logo}
                        className="h-full object-cover rounded-lg mr-3"
                    />
                    {seller.slice(0, 4)}...{seller.slice(-4)}
                </Link>
            </td>
            <td className="py-3 px-4">{tokenId}</td>
            <td className="py-3 px-4">
                <span className="text-sm font-semibold bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-md border border-blue-500/30">
                    {Number(price).toLocaleString()} PUFF
                </span>
            </td>
        </tr>
    );
};
