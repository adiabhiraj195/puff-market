"use client"
import { useState } from "react";
import { useWallet } from "@/contexts/WalletProvide";
import { ApeWorldContract } from "@/lib/ethersContract";
import Loading from "./ui/Loading";
import { useRouter } from "next/navigation";
import { createNft } from "@/api/nft";

const AddNewNftForm: React.FC = () => {
  const [nftAddress, setNftAddress] = useState<string>("");
  const [tokenId, setTokenId] = useState<string>("");
  const { isConnected, account, signer } = useWallet();
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isConnected) return;

    const nftContract = ApeWorldContract(nftAddress, signer);
    setLoading(true);
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
          imageURI: metadata.image,
          type: metadata.type
        }

        const response = await createNft(payload);
        console.log(response);
      }
      setLoading(false);
      router.refresh();
    } catch (error) {
      console.log(error);
    } finally {
      setNftAddress("");
      setTokenId("");
      setLoading(false);
    }

    console.log("NFT Address:", nftAddress);
    console.log("Token ID:", tokenId);

    // Clear form after submission

  };

  return (
    <div className="rounded-lg shadow-md w-2/5">

      {loading && <Loading />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="nftAddress"
            className="block text-md font-bold"
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="tokenId"
            className="block  text-md font-bold"
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
            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-transparent"
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