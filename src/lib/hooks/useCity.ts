import {
  CityDetails,
  CreateCityRes,
  GetCitiesRes,
} from "@/lib/schema/city.schema";
import { createCity, getCities } from "@/lib/services/location/city.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for consistency
export const cityKeys = {
  all: ["cities"] as const,
  lists: () => [...cityKeys.all, "list"] as const,
  list: () => [...cityKeys.lists()] as const,
  details: () => [...cityKeys.all, "detail"] as const,
  detail: (id: string) => [...cityKeys.details(), id] as const,
};

// Create City
export function useCreateCity() {
  const queryClient = useQueryClient();

  return useMutation<CreateCityRes, Error, CityDetails>({
    mutationFn: createCity,
    onSuccess: (response) => {
      // Show success message
      queryClient.invalidateQueries({ queryKey: cityKeys.lists() });

      toast(`City ${response.city.name} Created Successfully`, {
        description: "successful!",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },
    onError: (error: Error) => {
      toast(error.message || "Creating zone failed. Please try again.", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });
}

// Get Cities Hook
export function useGetCities() {
  return useQuery<GetCitiesRes>({
    queryKey: cityKeys.list(),
    queryFn: () => getCities(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
