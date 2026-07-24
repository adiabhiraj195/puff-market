import { NftInterface, NftMetadataInteface } from '@/types/nft-types'
import React from 'react'

export default function Nft_Details_Panel({ nft, metadata }: {
    nft: NftInterface | null
    metadata: NftMetadataInteface | null
}) {
    return (
        <div>
            <div>
                <img src={nft?.imageURI} alt=""></img>
            </div>

            <div>
                <p>
                    <strong>Name: </strong> {metadata?.name}
                </p>
                <p>
                    <strong>Description: </strong> {metadata?.description}
                </p>
                {nft?.isListed ?
                    <p>
                        <strong>Price: </strong> {nft.listing?.price}
                    </p> :
                    "Not listed yet"
                }
                <p>
                    <strong>Contract address: </strong> {nft?.contractAddress}
                </p>
                <p>
                    <strong>Owner: </strong> {nft?.owner.address}
                </p>
                <div>
                    <strong>Trait type: </strong>
                    <ol>
                        {metadata?.traits.map((attribute) => {
                            return (
                                <li key={attribute.key}>
                                    {attribute.key}: {attribute.value}
                                </li>
                            )
                        })}
                    </ol>
                </div>
            </div>
        </div>
    )
}
