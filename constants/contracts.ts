import NftMarketplaceArtifact from "@/contracts/Marketplace.sol/NftMarketplace.json";
import PuffTokenArtifact from "@/contracts/PuffToken.sol/PUFFTOKEN.json";
import NFTFactoryArtifact from "@/contracts/NFTFactory.sol/NFTFactory.json";
import MarketplaceNFTArtifact from "@/contracts/MarketplaceNFT.sol/MarketplaceNFT.json";
import PuffNFTArtifact from "@/contracts/PuffNft.sol/PuffNFTs.json";

// NftMarketplace Constants
export const MARKETPLACE_ADDRESS = (process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3") as `0x${string}`;
export const MARKETPLACE_ABI = NftMarketplaceArtifact.abi;
export const CONTRACT_ADDRESS = MARKETPLACE_ADDRESS; // Backwards compatibility
export const ABI = MARKETPLACE_ABI;                 // Backwards compatibility

// PuffToken Constants
export const PUFF_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_PUFF_TOKEN_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0") as `0x${string}`;
export const PUFF_TOKEN_ABI = PuffTokenArtifact.abi;
export const PUFF_TOKEN_PERMIT_NAME = "PuffToken";
export const PUFF_TOKEN_PERMIT_VERSION = "1";

// NFT Factory Constants
export const NFT_FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_NFT_FACTORY_ADDRESS || "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9") as `0x${string}`;
export const NFT_FACTORY_ABI = NFTFactoryArtifact.abi;
export const MARKETPLACE_NFT_ABI = MarketplaceNFTArtifact.abi;

// Puff NFT Constants
export const PUFF_NFT_ADDRESS = (process.env.NEXT_PUBLIC_PUFF_NFT_ADDRESS || "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512") as `0x${string}`;
export const PUFF_NFT_ABI = PuffNFTArtifact.abi;
