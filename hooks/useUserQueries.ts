import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserProfile,
  updateUserProfile,
  UserProfileResponse,
  UpdateProfilePayload,
} from "@/api/user";

export const USER_PROFILE_QUERY_KEY = ["userProfile"];

/**
 * Query hook for fetching current user profile.
 */
export function useUserProfile(options?: { enabled?: boolean; token?: string }) {
  return useQuery<UserProfileResponse, Error>({
    queryKey: USER_PROFILE_QUERY_KEY,
    queryFn: () => getUserProfile(options?.token),
    enabled: options?.enabled ?? true,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Mutation hook for updating user profile.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation<UserProfileResponse, Error, UpdateProfilePayload>({
    mutationFn: (payload: UpdateProfilePayload) => updateUserProfile(payload),
    onSuccess: (data) => {
      queryClient.setQueryData(USER_PROFILE_QUERY_KEY, data);
      queryClient.invalidateQueries({ queryKey: USER_PROFILE_QUERY_KEY });
    },
  });
}
