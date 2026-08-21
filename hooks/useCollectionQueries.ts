import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCollections,
  getUserCollections,
  getCollectionDetails,
  registerCollection,
} from "@/api/nft";

export const ALL_COLLECTIONS_QUERY_KEY = ["allCollections"];
export const USER_COLLECTIONS_QUERY_KEY = ["userCollections"];
export const collectionDetailsQueryKey = (contractAddress: string) => [
  "collectionDetails",
  contractAddress,
];

/**
 * Query hook to fetch all platform collections.
 */
export function useAllCollections(options?: { enabled?: boolean }) {
  return useQuery<any[], Error>({
    queryKey: ALL_COLLECTIONS_QUERY_KEY,
    queryFn: () => getAllCollections(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Query hook to fetch collections deployed/owned by the current user.
 */
export function useUserCollections(options?: { enabled?: boolean }) {
  return useQuery<any[], Error>({
    queryKey: USER_COLLECTIONS_QUERY_KEY,
    queryFn: () => getUserCollections(),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Query hook to fetch details of a single collection by contract address.
 */
export function useCollectionDetails(
  contractAddress: string,
  options?: { enabled?: boolean }
) {
  return useQuery<any, Error>({
    queryKey: collectionDetailsQueryKey(contractAddress),
    queryFn: () => getCollectionDetails(contractAddress),
    enabled: (options?.enabled ?? true) && !!contractAddress,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Mutation hook to register a new collection clone on the backend.
 */
export function useRegisterCollection() {
  const queryClient = useQueryClient();

  return useMutation<
    { success: boolean; collection?: any; error?: string },
    Error,
    { contractAddress: string; name: string; symbol: string }
  >({
    mutationFn: (payload) => registerCollection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ALL_COLLECTIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_COLLECTIONS_QUERY_KEY });
    },
  });
}
