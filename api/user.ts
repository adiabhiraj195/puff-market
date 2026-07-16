import axiosClient from './axiosClient';

export interface UserProfile {
  id: string;
  walletAddress: string;
  username: string | null;
  bio: string | null;
  dob: string | null;
  avatarUrl: string | null;
  profileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  dob?: string;
  avatarUrl?: string;
}

export interface UserProfileResponse {
  success: boolean;
  user: UserProfile;
}

/**
 * Fetch the current user's profile details.
 * Optional token can be passed for Next.js Server Components.
 */
export async function getUserProfile(token?: string): Promise<UserProfileResponse> {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await axiosClient.get<UserProfileResponse>('/api/users/profile', config);
  return response.data;
}

/**
 * Update the current user's profile details.
 */
export async function updateUserProfile(payload: UpdateProfilePayload): Promise<UserProfileResponse> {
  const response = await axiosClient.put<UserProfileResponse>('/api/users/profile', payload);
  return response.data;
}
