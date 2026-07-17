import { Outfit } from "@/lib/fonts";
import { useReadContract } from 'wagmi';
import { PUFF_TOKEN_ADDRESS } from '@/constants/PuffToken';

const outfit = Outfit({
    weight: ["400", "600", "800"],
    subsets: ['latin']
})

interface NFTCardProps {
    tokenId: string;
    seller?: string;
    price?: string;
    imageUrl: string;
    name?: string;
    paymentToken?: string;
}

const NFTCard: React.FC<NFTCardProps> = ({ tokenId, seller, price, imageUrl, name, paymentToken }) => {
    const tokenAddress = paymentToken || "0x0000000000000000000000000000000000000000";
    const isEth = tokenAddress === "0x0000000000000000000000000000000000000000";
    const isPuff = !isEth && tokenAddress.toLowerCase() === PUFF_TOKEN_ADDRESS.toLowerCase();

    // Fetch token symbol if not PUFF or ETH
    const { data: tokenSymbol } = useReadContract({
        address: tokenAddress as `0x${string}`,
        abi: [{ constant: true, inputs: [], name: 'symbol', outputs: [{ name: '', type: 'string' }], payable: false, stateMutability: 'view', type: 'function' }] as const,
        functionName: 'symbol',
        query: {
            enabled: !isEth && !isPuff && !!tokenAddress,
        }
    });

    const symbol = isEth ? 'ETH' : (isPuff ? 'PUFF' : (tokenSymbol || 'Token'));
    return (
        <div className={`${outfit.className} group bg-zinc-900/60 backdrop-blur-md border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 flex flex-col h-full w-full`}>
            {/* NFT Image Container */}
            <div className="w-full aspect-square bg-zinc-950 overflow-hidden relative">
                <img 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" 
                    src={imageUrl} 
                    alt={name || `NFT #${tokenId}`} 
                />
                
                {/* Listing Status Badge */}
                <div className="absolute top-3 right-3 z-10">
                    {price ? (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-indigo-600 text-white border border-indigo-400/20 px-2.5 py-1 rounded-full shadow-lg">
                            Listed
                        </span>
                    ) : (
                        <span className="text-[9px] font-extrabold uppercase tracking-widest bg-zinc-950/80 text-zinc-400 border border-zinc-800/40 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-lg">
                            Unlisted
                        </span>
                    )}
                </div>

                {/* Token ID Badge */}
                <div className="absolute bottom-3 left-3 z-10">
                    <span className="text-xs font-mono font-bold bg-zinc-950/80 text-white border border-zinc-800/40 px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md">
                        #{tokenId}
                    </span>
                </div>
            </div>

            {/* Content info */}
            <div className="p-4 flex flex-col justify-between flex-grow gap-3">
                <div>
                    <h4 className="font-extrabold text-base text-zinc-100 group-hover:text-white transition-colors truncate">
                        {name || "Unnamed NFT"}
                    </h4>
                    
                    {seller && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Seller:</span>
                            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-950/40 px-2 py-0.5 rounded border border-zinc-850">
                                {seller.slice(0, 6)}...{seller.slice(-4)}
                            </span>
                        </div>
                    )}
                </div>

                <div className="border-t border-zinc-850 pt-3 flex items-end justify-between mt-auto">
                    {price ? (
                        <div>
                            <span className="text-zinc-500 text-[8px] font-bold tracking-widest uppercase block mb-0.5">Price</span>
                            <span className="text-yellow-400 font-extrabold text-sm font-mono flex items-center gap-1">
                                {Number(price).toLocaleString()} <span className="text-[9px] font-bold text-zinc-400">{symbol}</span>
                            </span>
                        </div>
                    ) : (
                        <div>
                            <span className="text-zinc-500 text-[8px] font-bold tracking-widest uppercase block mb-0.5">Status</span>
                            <span className="text-zinc-400 font-bold text-xs">
                                Vaulted
                            </span>
                        </div>
                    )}

                    <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors flex items-center gap-0.5">
                        Details <span className="transition-transform group-hover:translate-x-0.5 inline-block">→</span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default NFTCard;