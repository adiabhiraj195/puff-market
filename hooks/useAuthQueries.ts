import { useMutation } from "@tanstack/react-query";
import { getSiweNonce, verifySiwe, NonceResponse, VerifyResponse } from "@/api/auth";

/**
 * Mutation hook to fetch SIWE nonce for a wallet address.
 */
export function useSiweNonce() {
  return useMutation<NonceResponse, Error, string>({
    mutationFn: (address: string) => getSiweNonce(address),
  });
}

/**
 * Mutation hook to verify SIWE message and signature.
 */
export function useVerifySiwe() {
  return useMutation<
    VerifyResponse,
    Error,
    { message: string; signature: string; address: string }
  >({
    mutationFn: ({ message, signature, address }) =>
      verifySiwe(message, signature, address),
  });
}
