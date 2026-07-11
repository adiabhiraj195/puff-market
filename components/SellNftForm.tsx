'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import { useWallet } from '@/contexts/WalletProvide';
import { ApeWorldContract, MarketContract } from '@/lib/ethersContract';
import { CONTRACT_ADDRESS } from '@/constants/contractConfig';
import { Outfit, Staatliches } from "@next/font/google";
import Loading from './ui/Loading';
import { createNft } from '@/api/nft';

const statliche = Staatliches({
    weight: ["400"],
    subsets: ['latin']
})

const outfit = Outfit({
    weight: ["400"],
    subsets: ['latin']
})

const SellNFTForm = () => {
    const [nftAddress, setNftAddress] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [price, setPrice] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const { isConnected, account, signer } = useWallet();

    async function listOnChain(nftAddress: string, tokenId: string, price: string) {
        if (!isConnected) return;

        try {
            const marketContract = MarketContract(signer);
            const nftContract = ApeWorldContract(nftAddress, signer);

            const owner = await nftContract.ownerOf(tokenId);
            console.log(`Owner of tokenId ${tokenId}:`, owner);

            if (owner.toLowerCase() !== account?.toLowerCase()) {
                throw new Error(`Signer does not own tokenId ${tokenId}`);
            }

            const approvalTx = await nftContract.approve(CONTRACT_ADDRESS, tokenId);
            await approvalTx.wait();
            console.log("approved")

            const priceInWei = ethers.parseEther(price); // Convert price to wei (smallest ETH unit)

            const tx = await marketContract.listItem(nftAddress, tokenId, priceInWei);
            // console.log("listed", tx.hash);

            const receipt = await tx.wait();
            console.log("list waited", receipt)

            const uri = await nftContract.tokenURI(tokenId);

            setSuccessMessage(`NFT listed successfully! Transaction Hash: ${receipt.hash}`);

            return { txHash: receipt.hash, uri };
        } catch (error) {
            console.error(error);
        }
    }
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);
        setIsSubmitting(true);

        if (!isConnected) {
            setError("wallet is not connected");
            setIsSubmitting(false);
            return;
        }

        try {
            const listdata = await listOnChain(nftAddress, tokenId, price);
            // const txHash = "0x9881abfd5aba34ab5bfcdf08e8808bddca02196a5bcf3ce234c9035d62bb6c63"

            const payload = {
                nftAddress: nftAddress,
                tokenId: tokenId,
                price: price,
                account: account,
                txHash: listdata?.txHash,
                uri: listdata?.uri
            }
            // send data to backend
            const response = await createNft(payload);
            console.log("response:", response);
            // request to backend to update database listing, transaction history;

        } catch (err) {
            console.log(err)
            setError(`Error listing NFT: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 w-full flex flex-col">
            {isSubmitting && <Loading />}
            <div>
                <label htmlFor="nftAddress" className={`${outfit.className} text-gray-400 text-lg`
                }>
                    NFT Address
                </label>
                <input
                    type="text"
                    id="nftAddress"
                    value={nftAddress}
                    onChange={(e) => setNftAddress(e.target.value)}
                    required
                    className="mt-1 p-2 block w-full border-gray-300 border-2 rounded-xl shadow-sm text-white"
                />
            </div>

            <div>
                <label htmlFor="tokenId" className={`${outfit.className} text-gray-400 text-lg`
                }>
                    Token ID
                </label>
                <input
                    type="text"
                    id="tokenId"
                    value={tokenId}
                    onChange={(e) => setTokenId(e.target.value)}
                    required
                    className="mt-1 p-2 block w-full border-gray-300 border-2 rounded-xl shadow-sm text-white"
                />
            </div>

            <div>
                <label htmlFor="price" className={`${outfit.className} text-gray-400 text-lg`
                }>
                    Price (in ETH)
                </label>
                <input
                    type="text"
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="mt-1 p-2 block w-full border-gray-300 border-2 rounded-xl shadow-sm text-white"
                />
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${statliche.className} hover:bg-gradient-to-l hover:from-fuchsia-200 hover:to-sky-300 btn rounded-l text-2xl text-center w-36`}
                >
                    {isSubmitting ? 'Listing NFT...' : 'Sell NFT'}
                </button>
            </div>

            {error && <p className="text-red-500 mt-2">{error}</p>}
            {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        </form>
    );
};

export default SellNFTForm;

// try {
//     // Step 1: Verify ownership of the NFT
//     const owner = await nftContract.ownerOf(tokenId);
//     console.log(`Owner of tokenId ${tokenId}:`, owner);

//     if (owner.toLowerCase() !== signer.address.toLowerCase()) {
//       throw new Error(`Signer does not own tokenId ${tokenId}`);
//     }

//     // Step 2: Approve the marketplace to transfer the NFT on your behalf
//     const approvalTx = await nftContract.approve(CONTRACT_ADDRESS, tokenId);
//     console.log("Approval transaction sent:", approvalTx.hash);

//     // Wait for the transaction to be confirmed
//     await approvalTx.wait();
//     console.log(`Marketplace approved for tokenId ${tokenId}`);

//     // Step 3: List the NFT in the marketplace
//     const priceInWei = ethers.utils.parseEther(priceInEther); // Convert price to wei (smallest ETH unit)
//     const listTx = await marketplaceContract.listItem("0x3FBf1bf55cD660A06019923Ef8dD58E3ba5B0791", tokenId, priceInWei);
//     console.log("Listing transaction sent:", listTx.hash);

//     // Wait for the transaction to be confirmed
//     await listTx.wait();
//     console.log(`NFT tokenId ${tokenId} listed for ${priceInEther} ETH`);

//   } catch (error) {
//     console.error("Error listing NFT:", error);
//   }