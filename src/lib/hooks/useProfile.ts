import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProfile,
  updateProfile,
} from "@/lib/services/profile.service";
import {
  ProfileFormData,
  GetProfileRes,
} from "../schema/profile.schema";

export const profileKeys = {
  all: ["profile"] as const,
  detail: () => [...profileKeys.all, "detail"] as const,
};

// Get profile
export function useGetProfile() {
  return useQuery<GetProfileRes, Error>({
    queryKey: profileKeys.detail(),
    queryFn: () => getProfile(),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => updateProfile(data),
    onSuccess: () => {
      // Invalidate the profile query to refetch updated data
      queryClient.invalidateQueries({ queryKey: profileKeys.detail() });
    },
    onError: (error) => {
      console.error("Update profile error:", error);
    },
  });
}
