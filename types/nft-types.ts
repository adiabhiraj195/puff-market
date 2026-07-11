import { User } from "./user-type";

export interface NftInterface {
    tokenId: string;
    id: string;
    contractAddress: string;
    ownerId: string;
    metadataURI: string;
    imageURI: string;
    isListed: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: User
    listing?: {
        price: string
    }
}

export interface NftMetadataInteface {
    name: string;
    description: string;
    price?: string;
    creator: { name: string };
    traits: NftAttributes[];
}

interface NftAttributes {
    key: string;
    value: string;
}

export interface ListingInterface {
    imageURI: string;
    id: string;
    nftId: string;
    sellerId: string;
    price: string;
    status: ListingStatus;
    createdAt: Date;
    updatedAt: Date;
    nft: {
        imageURI: string;
        tokenId: string;
    }
    seller: {
        address: string
    }
}

enum ListingStatus {
    ACTIVE,
    SOLD,
    CANCELED
}
