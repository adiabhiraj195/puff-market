"use client"
import { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "@/contexts/WalletProvide";
import { ApeWorldContract } from "@/utils/ethersContract";

const AddNewNftForm: React.FC = () => {
  const [nftAddress, setNftAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const { isConnected, account, signer } = useWallet();


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) return;

    const nftContract = ApeWorldContract(nftAddress, signer);

    try {
      const owner = await nftContract.ownerOf(tokenId);
      console.log(`Owner of tokenId ${tokenId}:`, owner);

      if (owner.toLowerCase() !== account?.toLowerCase()) {
        throw new Error(`Signer does not own tokenId ${tokenId}`);
      }

      const uri = await nftContract.tokenURI(tokenId);

      if (uri) {
        console.log(uri);
        const result = await fetch(uri);
        const metadata = await result.json();

        const payload = {
          tokenId,
          contractAddress: nftAddress,
          metadataURI: uri,
          imageURI: metadata.image
        }

        const response = await fetch("/api/nft", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload)
        })

        console.log(await response.json());
      }

    } catch (error) {
      console.log(error);
    } finally {
      // setNftAddress("");
      // setTokenId("");
    }

    console.log("NFT Address:", nftAddress);
    console.log("Token ID:", tokenId);

    // Clear form after submission

  };

  return (
    <div className="min-w-full mx-auto p-6 rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="nftAddress"
            className="block text-sm font-medium text-gray-700"
          >
            NFT Address:
          </label>
          <input
            type="text"
            id="nftAddress"
            value={nftAddress}
            onChange={(e) => setNftAddress(e.target.value)}
            placeholder="Enter NFT Contract Address"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="tokenId"
            className="block text-sm font-medium text-gray-700"
          >
            Token ID:
          </label>
          <input
            type="text"
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="Enter NFT Token ID"
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default AddNewNftForm;