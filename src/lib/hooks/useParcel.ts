import {
  parcelFilterOptions,
  ParcelFormData,
} from "@/lib/schema/parcel.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createParcel,
  deleteParcel,
  getParcelById,
  getParcels,
  updateParcel,
} from "../services/parcel.service";

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
  });
}

// Get parcels
export function useGetParcels(filters?: parcelFilterOptions) {
  return useQuery({
    queryKey: parcelKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getParcels(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}

// Get single parcel by ID
export function useGetParcelById(id: string, enabled = true) {
  return useQuery({
    queryKey: parcelKeys.detail(id),
    queryFn: () => getParcelById(id),
    enabled: !!id && enabled, // Only run if ID exists and enabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update parcel mutation
export function useUpdateParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ParcelFormData> }) =>
      updateParcel(id, data),
    onSuccess: (_, variables) => {
      toast.success("Parcel updated successfully");
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: parcelKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: parcelKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update parcel");
    },
  });
}

// Delete parcel mutation
export function useDeleteParcel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteParcel,
    onSuccess: () => {
      toast.success("Parcel deleted successfully");
      queryClient.invalidateQueries({ queryKey: parcelKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete parcel");
    },
  });
}
