import { useMutation, useQueryClient } from "@tanstack/react-query";
import axiosClient from "@/api/axiosClient";
import { NFT_LISTINGS_QUERY_KEY, USER_NFTS_QUERY_KEY } from "./useNftQueries";

export interface ConfirmMintPayload {
  tokenId: string;
  metadataURI: string;
  metadata?: any;
  contractAddress?: string;
}

/**
 * Mutation hook for uploading media asset and metadata to IPFS via server endpoint.
 */
export function useUploadIpfsMedia() {
  return useMutation<
    { success: boolean; tokenURI: string; metadata: any; error?: string },
    Error,
    FormData
  >({
    mutationFn: async (formData: FormData) => {
      const response = await axiosClient.post("/api/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
  });
}

/**
 * Mutation hook for confirming on-chain mint on the backend.
 */
export function useConfirmMint() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; nft?: any; error?: string },
    Error,
    ConfirmMintPayload
  >({
    mutationFn: async (payload: ConfirmMintPayload) => {
      const response = await axiosClient.post("/api/media/confirm-mint", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NFT_LISTINGS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_NFTS_QUERY_KEY });
    },
  });
}
