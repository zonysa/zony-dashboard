import {
  partnerFilterOptions,
  PartnerFormData,
} from "@/lib/schema/partner.schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createPartner,
  deletePartner,
  getPartner,
  getPartnerBranches,
  getPartners,
  updatetPartner,
} from "../services/partner.service";

// Query keys for consistency
export const partnerKeys = {
  all: ["partners"] as const,
  lists: () => [...partnerKeys.all, "list"] as const,
  list: (filters: string) => [...partnerKeys.lists(), { filters }] as const,
  details: () => [...partnerKeys.all, "detail"] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
  branches: (id: string) => [...partnerKeys.all, "branches", id] as const,
};

// Create Partner mutation
export function useCreatePartner() {
  return useMutation({
    mutationFn: createPartner,
    onSuccess: () => {
      toast.success("Partner created successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create partner");
    },
  });
}

// Get Partners
export function useGetPartners(filters?: partnerFilterOptions) {
  return useQuery({
    queryKey: partnerKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getPartners(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}

// Get Partner by ID hook
export function useGetPartner(id: string, enabled = true) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: () => getPartner(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get Partner Branches
export function useGetPartnerBranches(id: string, enabled = true) {
  return useQuery({
    queryKey: partnerKeys.branches(id),
    queryFn: () => getPartnerBranches(id),
    enabled: !!id && enabled, // Only run if ID exists and enabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update partner mutation
export function useUpdatePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<PartnerFormData>;
    }) => updatetPartner(id, data),
    onSuccess: (_, variables) => {
      toast.success("Partner updated successfully");
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: partnerKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update partner");
    },
  });
}

// Delete partner mutation
export function useDeletePartner() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      toast.success("Partner deleted successfully");
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete partner");
    },
  });
}
