import {
  DistrictBase,
  CreateDistrictRes,
  GetDistrictsRes,
  DistrictFormData,
} from "@/lib/schema/district.schema";
import {
  createDistrict,
  getDistricts,
} from "@/lib/services/location/district.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// Query keys for consistency
export const districtKeys = {
  all: ["districts"] as const,
  lists: () => [...districtKeys.all, "list"] as const,
  list: (filters: string) => [...districtKeys.lists(), { filters }] as const,
  details: () => [...districtKeys.all, "detail"] as const,
  detail: (id: string) => [...districtKeys.details(), id] as const,
};

// Create district
export function useCreateDistrict() {
  const queryClient = useQueryClient();

  return useMutation<CreateDistrictRes, Error, DistrictFormData>({
    mutationFn: createDistrict,
    onSuccess: () => {
      // Show success message
      queryClient.invalidateQueries({ queryKey: districtKeys.lists() });
    },
    onError: (error: Error) => {
      console.log(error);
    },
  });
}

// Get Cities Hook
export function useGetDistricts(cityId?: number) {
  return useQuery<GetDistrictsRes>({
    queryKey: districtKeys.list(cityId?.toString() || ""),
    queryFn: () => getDistricts(cityId),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
