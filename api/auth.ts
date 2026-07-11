import axiosClient from './axiosClient';

export interface NonceResponse {
  message: string;
  nonce: string;
}

export interface VerifyResponse {
  success: boolean;
  token: string;
  user: any;
  error?: string;
}

/**
 * Request SIWE nonce and message string for a given wallet address.
 */
export async function getSiweNonce(address: string): Promise<NonceResponse> {
  const response = await axiosClient.post<NonceResponse>('/api/auth/nonce', { address });
  return response.data;
}

/**
 * Verify SIWE signed message and signature.
 */
export async function verifySiwe(
  message: string,
  signature: string,
  address: string
): Promise<VerifyResponse> {
  const response = await axiosClient.post<VerifyResponse>('/api/auth/verify', {
    message,
    signature,
    address,
  });
  return response.data;
}
