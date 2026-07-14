import axiosClient from './axiosClient';
import { ListingInterface, NftInterface } from '@/types/nft-types';
import { TransactionInterface } from '@/types/transaction-types';

export interface GetNftByIdResponse {
  success: boolean;
  nft: NftInterface;
}

export interface CreateNftPayload {
  tokenId: string;
  contractAddress?: string;
  metadataURI?: string;
  imageURI?: string;
  type?: string;
  nftAddress?: string;
  price?: string;
  account?: string | null;
  txHash?: string;
  uri?: string;
}

export interface BuyNftPayload {
  sellerId: string;
  txHash: string;
  price: string;
}

export interface GetNftTransactionsResponse {
  success: boolean;
  transactions: TransactionInterface[];
}

/**
 * Fetch all active NFT listings.
 */
export async function getNftListings(): Promise<ListingInterface[]> {
  const response = await axiosClient.get<ListingInterface[]>('/api/nft/listings');
  return response.data;
}

/**
 * Fetch all NFTs owned by the current authenticated user.
 * Optional token can be passed for Next.js Server Components.
 */
export async function getUserNfts(token?: string): Promise<NftInterface[]> {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axiosClient.get<NftInterface[]>('/api/nft/user', config);
  return response.data;
}

/**
 * Fetch an NFT by its ID.
 */
export async function getNftById(id: string): Promise<GetNftByIdResponse> {
  const response = await axiosClient.get<GetNftByIdResponse>(`/api/nft/${id}`);
  return response.data;
}

/**
 * Create a new NFT record in the backend database.
 */
export async function createNft(payload: CreateNftPayload): Promise<{ data: any }> {
  const response = await axiosClient.post<{ data: any }>('/api/nft', payload);
  return response.data;
}



/**
 * Complete purchase of an NFT.
 */
export async function buyNft(nftId: string, payload: BuyNftPayload): Promise<{ success: boolean }> {
  const response = await axiosClient.post<{ success: boolean }>(`/api/nft/buy/${nftId}`, payload);
  return response.data;
}

/**
 * Cancel an NFT listing.
 */
export async function cancelListing(nftId: string): Promise<{ success: boolean }> {
  const response = await axiosClient.post<{ success: boolean }>(`/api/nft/cancel/${nftId}`);
  return response.data;
}

/**
 * Fetch all transactions for a specific NFT.
 */
export async function getNftTransactions(nftId: string): Promise<GetNftTransactionsResponse> {
  const response = await axiosClient.get<GetNftTransactionsResponse>(`/api/nft/transaction/${nftId}`);
  return response.data;
}

/**
 * Create listing on backend for a confirmed listing transaction
 */
export async function createListing(tokenId: string, price: string, txHash: string): Promise<{ success: boolean; listing: any }> {
  const response = await axiosClient.post<{ success: boolean; listing: any }>('/api/listings', { tokenId, price, txHash });
  return response.data;
}
