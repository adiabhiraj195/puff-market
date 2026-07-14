import { Outfit, Staatliches } from "next/font/google";

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})
const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

interface NFTCardProps {
    tokenId: string;
    seller?: string;
    price?: string;
    imageUrl: string;
    name?: string
}

const NFTCard: React.FC<NFTCardProps> = ({ tokenId, seller, price, imageUrl, name }) => {

    return (
        <div className="border-2 border-white rounded-xl overflow-hidden w-56">
            {/* NFT Image */}
            <div className="w-full h-56 bg-cover bg-center overflow-hidden relative">
                <img className="absolute h-full object-cover w-full " src={imageUrl} alt={`NFT name`} />
            </div>

            <div className="px-6 py-4">
                <div className={`${statliche.className} font-bold text-2xl mb-2 flex justify-between`}>
                    {name && name}
                    <div>
                        <p className="text-gray-400 text-base border-2 rounded-lg px-2 border-gray-400">
                            #{tokenId}
                        </p>
                    </div>

                </div>

                {seller &&
                    <div className="flex gap-1">
                        <p className={`${statliche.className} text-lg`}>
                            Seller :
                        </p>
                        <p className={`${statliche.className} text-lg text-gray-400`}>
                            {seller.slice(0, 6)}...{seller.slice(-4)}
                        </p>
                    </div>
                }
                {price && <div className="flex gap-1">
                    <p className={`${statliche.className} text-lg`}>
                        Price :
                    </p>
                    <p className={`${statliche.className} text-lg text-gray-400`}>
                        {price}
                    </p>
                </div>}
            </div>

        </div>
    );
};

export default NFTCard;