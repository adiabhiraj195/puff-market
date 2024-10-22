import db from "@/utils/db";

interface NftInterface {
    tokenId: string;
    contractAddress: string;
    ownerId: string;
    metadataURI: string;
    imageURI: string;
}

export async function addNftToDatabase({
    tokenId,
    contractAddress,
    ownerId,
    metadataURI,
    imageURI
}: NftInterface) {
    try {

        return await db.nFT.create({
            data: {
                tokenId,
                contractAddress,
                ownerId,
                metadataURI,
                imageURI
            }
        })
    } catch (error) {
        console.log(error)
    }
}

export async function getNftByAddressAndTokenId({ contractAddress, tokenId }: { contractAddress: string, tokenId: string }) {

    try {
        return await db.nFT.findMany({
            where: {
                contractAddress,
                tokenId,
            }
        })
    } catch (error) {

    }
}