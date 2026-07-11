"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import Loading from "@/components/ui/Loading";
import { Staatliches } from "@next/font/google";
import { NftInterface, NftMetadataInteface } from "@/types/nft-types";
import List_Nft_Popup from "@/components/list-nft-popup";
import Nft_Details_Panel from "@/components/nft-details-panel";
import Cancel_Listing_Button from "@/components/ui/buttons/cancel-listing-button";
import Nft_Transaction from "@/components/nft-transations";
import { getNftById } from "@/api/nft";
export default function NftAsAssetPage() {
    const { id } = useParams();

    const [loading, setLoading] = useState<boolean>(false);
    const [nft, setNft] = useState<NftInterface | null>(null);
    const [metadata, setMetadata] = useState<NftMetadataInteface | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => setIsOpen(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const result = await getNftById(id as string);
                if (result.success) {
                    setNft(result.nft);

                    const metadata = await fetch(result.nft.metadataURI);
                    setMetadata(await metadata.json())
                }
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [])
    return (
        <div>
            {loading && <Loading />}
            {isOpen && <List_Nft_Popup
                setIsOpen={setIsOpen}
                nftId={id as string}
                nftContract={nft?.contractAddress as string}
                tokenId={nft?.tokenId as string}
            />}

            <Nft_Details_Panel nft={nft} metadata={metadata} />

            <div>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    disabled={nft?.isListed}
                    onClick={openModal}
                >
                    {nft?.isListed ? "allready listed" : " List NFT"}
                </button>

                <Cancel_Listing_Button
                    nftId={id as string}
                    nftAddress={nft?.contractAddress as string}
                    tokenId={nft?.tokenId as string}
                />

            </div>

            <div>

                <Nft_Transaction nftId={id as string} />

            </div>
        </div>
    )
}
