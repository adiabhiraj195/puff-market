import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNftListings,
  getUserNfts,
  getNftById,
  createNft,
  buyNft,
  cancelListing,
  getNftTransactions,
  createListing,
  GetNftByIdResponse,
  GetNftTransactionsResponse,
  CreateNftPayload,
  BuyNftPayload,
} from "@/api/nft";
import { ListingInterface, NftInterface, NftMetadataInteface } from "@/types/nft-types";

export const NFT_LISTINGS_QUERY_KEY = ["nftListings"];
export const USER_NFTS_QUERY_KEY = ["userNfts"];
export const nftDetailsQueryKey = (id: string) => ["nftDetails", id];
export const nftTransactionsQueryKey = (id: string) => ["nftTransactions", id];

/**
 * Query hook to fetch all active NFT listings.
 */
export function useNftListings(options?: { enabled?: boolean }) {
  return useQuery<ListingInterface[], Error>({
    queryKey: NFT_LISTINGS_QUERY_KEY,
    queryFn: () => getNftListings(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Query hook to fetch NFTs owned by current user.
 */
export function useUserNfts(token?: string, options?: { enabled?: boolean }) {
  return useQuery<NftInterface[], Error>({
    queryKey: USER_NFTS_QUERY_KEY,
    queryFn: () => getUserNfts(token),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export interface ResolvedNftDetails {
  nft: NftInterface | null;
  metadata: NftMetadataInteface | null;
}

/**
 * Query hook to fetch an NFT by ID along with resolving IPFS metadata.
 */
export function useNftDetails(id: string, options?: { enabled?: boolean }) {
  return useQuery<ResolvedNftDetails, Error>({
    queryKey: nftDetailsQueryKey(id),
    queryFn: async () => {
      if (!id) return { nft: null, metadata: null };
      const result: GetNftByIdResponse = await getNftById(id);
      if (!result.success || !result.nft) {
        return { nft: null, metadata: null };
      }

      const nft = result.nft;
      let metadata: NftMetadataInteface = {
        name: nft.name || "",
        description: nft.description || "",
        creator: { name: nft.creatorAddress || nft.owner?.userName || "Anonymous" },
        traits: Array.isArray(nft.attributes)
          ? nft.attributes.map((a: any) => ({
              key: a.key || a.trait_type || "",
              value: a.value || "",
            }))
          : [],
      };

      try {
        let ipfsUrl = nft.metadataURI;
        if (ipfsUrl && ipfsUrl.startsWith("ipfs://")) {
          ipfsUrl = `https://sapphire-keen-aardvark-438.mypinata.cloud/ipfs/${ipfsUrl.replace(
            "ipfs://",
            ""
          )}`;
        }
        if (ipfsUrl) {
          const metadataRes = await fetch(ipfsUrl);
          if (metadataRes.ok) {
            const ipfsJson = await metadataRes.json();
            metadata = {
              name: ipfsJson.name || nft.name || "",
              description: ipfsJson.description || nft.description || "",
              creator: {
                name:
                  ipfsJson.creator?.name ||
                  ipfsJson.author ||
                  nft.creatorAddress ||
                  "Anonymous",
              },
              traits: Array.isArray(ipfsJson.traits || ipfsJson.attributes)
                ? (ipfsJson.traits || ipfsJson.attributes).map((a: any) => ({
                    key: a.key || a.trait_type || "",
                    value: a.value || "",
                  }))
                : metadata.traits,
            };
          }
        }
      } catch (err) {
        console.warn("IPFS metadata resolution warning:", err);
      }

      return { nft, metadata };
    },
    enabled: (options?.enabled ?? true) && !!id,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Query hook to fetch transactions for a specific NFT.
 */
export function useNftTransactions(nftId: string, options?: { enabled?: boolean }) {
  return useQuery<GetNftTransactionsResponse, Error>({
    queryKey: nftTransactionsQueryKey(nftId),
    queryFn: () => getNftTransactions(nftId),
    enabled: (options?.enabled ?? true) && !!nftId,
    staleTime: 1000 * 30,
  });
}

/**
 * Mutation hook to create an NFT backend record.
 */
export function useCreateNft() {
  const queryClient = useQueryClient();

  return useMutation<{ data: any }, Error, CreateNftPayload>({
    mutationFn: (payload: CreateNftPayload) => createNft(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NFT_LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_NFTS_QUERY_KEY });
    },
  });
}

/**
 * Mutation hook to buy an NFT.
 */
export function useBuyNft() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean },
    Error,
    { nftId: string; payload: BuyNftPayload }
  >({
    mutationFn: ({ nftId, payload }) => buyNft(nftId, payload),
    onSuccess: (_, { nftId }) => {
      queryClient.invalidateQueries({ queryKey: NFT_LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_NFTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: nftDetailsQueryKey(nftId) });
      queryClient.invalidateQueries({ queryKey: nftTransactionsQueryKey(nftId) });
    },
  });
}

/**
 * Mutation hook to cancel an NFT listing.
 */
export function useCancelListing() {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean }, Error, string>({
    mutationFn: (nftId: string) => cancelListing(nftId),
    onSuccess: (_, nftId) => {
      queryClient.invalidateQueries({ queryKey: NFT_LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_NFTS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: nftDetailsQueryKey(nftId) });
    },
  });
}

/**
 * Mutation hook to create a marketplace listing.
 */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; listing: any },
    Error,
    { tokenId: string; price: string; txHash: string; paymentToken?: string }
  >({
    mutationFn: ({ tokenId, price, txHash, paymentToken }) =>
      createListing(tokenId, price, txHash, paymentToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NFT_LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_NFTS_QUERY_KEY });
    },
  });
}
