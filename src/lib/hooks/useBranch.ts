import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  BranchFilterOptions,
  BranchFormData,
  GetBranchesRes,
  GetBranchRes,
} from "@/lib/schema/branch.schema";
import {
  createBranch,
  deleteBranch,
  getBranchById,
  getBranches,
  getBranchParcels,
  updaetBranch,
} from "../services/branch.service";
import { getParcelsRes } from "../schema/parcel.schema";

// Query keys for consistency
export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters: string) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
  parcels: (id: string) => [...branchKeys.all, "parcels", id] as const,
};

// Create Branch mutation
export function useCreateBranch() {
  return useMutation({
    mutationFn: createBranch,
    onError: (error) => {
      toast.error(error?.message || "Failed to create branch");
    },
  });
}

// Get Branches
export function useGetBranches(filters?: BranchFilterOptions) {
  return useQuery<GetBranchesRes>({
    queryKey: branchKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getBranches(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}

// Get single branch by ID
export function useGetBranch(id: string, enabled = true) {
  return useQuery<GetBranchRes>({
    queryKey: branchKeys.detail(id),
    queryFn: () => getBranchById(id),
    enabled: !!id && enabled, // Only run if ID exists and enabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get Branch Parcels
export function useGetBranchParcels(id: string, enabled = true) {
  return useQuery<getParcelsRes>({
    queryKey: branchKeys.parcels(id),
    queryFn: () => getBranchParcels(id),
    enabled: !!id && enabled, // Only run if ID exists and enabled
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update branch mutation
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BranchFormData> }) =>
      updaetBranch(id, data),
    onSuccess: (_, variables) => {
      toast.success("Branch updated successfully");
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: branchKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update branch");
    },
  });
}

// Delete branch mutation
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      toast.success("Branch deleted successfully");
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete branch");
    },
  });
}
