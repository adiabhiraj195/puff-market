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
    owner: User;
    listing?: {
        price: string;
        paymentToken?: string;
    };
    name?: string;
    description?: string;
    attributes?: any;
    creatorAddress?: string;
    collectionAddress?: string | null;
    collection?: {
        id: string;
        name: string;
        symbol: string;
        contractAddress: string;
    } | null;
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
    paymentToken?: string;
    status: ListingStatus;
    createdAt: Date;
    updatedAt: Date;
    nft: {
        imageURI: string;
        tokenId: string;
        name?: string;
        description?: string;
        mediaType?: string;
        contractAddress?: string;
        collectionAddress?: string | null;
        collection?: {
            id: string;
            name: string;
            symbol: string;
            contractAddress: string;
        } | null;
    }
    seller: {
        address: string;
        id?: string;
        username?: string | null;
    }
}

enum ListingStatus {
    ACTIVE,
    SOLD,
    CANCELED
}
