
import React from 'react'
import { useState } from 'react';
import { ApeWorldContract, MarketContract } from '@/lib/ethersContract';
import { useWallet } from '@/contexts/WalletProvide';
import { CONTRACT_ADDRESS } from '@/constants/contractConfig';
import { ethers } from 'ethers';
import Loading from './ui/Loading';
import { listNft } from '@/api/nft';

interface Nft_Popup_Interface {
  nftId: string;
  nftContract: string;
  tokenId: string;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function List_Nft_Popup({
  nftId,
  nftContract,
  tokenId,
  setIsOpen
}: Nft_Popup_Interface) {
  const { isConnected, signer } = useWallet();
  const [price, setPrice] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return

    try {
      setLoading(true);
      const marketContract = MarketContract(signer);
      const apeContract = ApeWorldContract(nftContract, signer)

      const approvalTx = await apeContract.approve(CONTRACT_ADDRESS, tokenId);
      await approvalTx.wait();

      const priceInWei = ethers.parseEther(price);

      const tx = await marketContract.listItem(nftContract, tokenId, priceInWei);
      await tx.wait();

      const list = await listNft(nftId, price);
      console.log(list);
    } catch (error) {
      console.log(error)
    } finally {

      setLoading(false);
      setIsOpen(false);
    }
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      {loading && <Loading />}
      <div className=" rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">List NFT on Marketplace</h2>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Price
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="Price You wana sell"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="mr-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {loading ? "Listing..." : "List NFT"}
            </button>
          </div>
        </form>
      </div>
    </div >
  )
}
