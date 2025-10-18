import { getParcelsRes, parcelFilterOptions } from "@/lib/schema/parcel.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createParcel, getParcels } from "../services/parcel.service";

// Query keys for consistency
export const parcelKeys = {
  all: ["parcels"] as const,
  lists: () => [...parcelKeys.all, "list"] as const,
  list: (filters: string) => [...parcelKeys.lists(), { filters }] as const,
  details: () => [...parcelKeys.all, "detail"] as const,
  detail: (id: string) => [...parcelKeys.details(), id] as const,
};

// Create parcel mutation
export function useCreateParcel() {
  return useMutation({
    mutationFn: createParcel,
    onSuccess: () => {
      toast.success("parcel created successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create parcel");
    },
  });
}

// Get parcels
export function useGetParcels(filters?: parcelFilterOptions) {
  return useQuery<getParcelsRes, Error>({
    queryKey: parcelKeys.list(filters || ""),
    queryFn: () => getParcels(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}
