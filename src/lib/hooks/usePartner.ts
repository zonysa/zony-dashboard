import {
  GetPartnersRes,
  partnerFilterOptions,
} from "@/lib/schema/partner.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPartner, getPartners } from "../services/partner.service";

// Query keys for consistency
export const partnerKeys = {
  all: ["partners"] as const,
  lists: () => [...partnerKeys.all, "list"] as const,
  list: (filters: string) => [...partnerKeys.lists(), { filters }] as const,
  details: () => [...partnerKeys.all, "detail"] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
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
  return useQuery<GetPartnersRes, Error>({
    queryKey: partnerKeys.list(filters || ""),
    queryFn: () => getPartners(filters || {}),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}
