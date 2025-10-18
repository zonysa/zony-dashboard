import {
  BranchFilterOptions,
  GetBranchesRes,
} from "@/lib/schema/branch.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createBranch, getBranches } from "../services/branch.service";

// Query keys for consistency
export const branchKeys = {
  all: ["branches"] as const,
  lists: () => [...branchKeys.all, "list"] as const,
  list: (filters: string) => [...branchKeys.lists(), { filters }] as const,
  details: () => [...branchKeys.all, "detail"] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
};

// Create Branch mutation
export function useCreateBranch() {
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      toast.success("Branch created successfully");
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create branch");
    },
  });
}

// Get Branches
export function useGetBranches(filters?: BranchFilterOptions) {
  return useQuery<GetBranchesRes, Error>({
    queryKey: branchKeys.list(filters || ""),
    queryFn: () => getBranches(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}
