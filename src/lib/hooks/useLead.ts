import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  GetLeadRes,
  GetLeadsRes,
  LeadFilterOptions,
  UpdateLeadRequest,
} from "@/lib/schema/lead.schema";
import { getLead, getLeads, updateLead } from "../services/lead.service";

// Query keys for consistency
export const leadKeys = {
  all: ["leads"] as const,
  lists: () => [...leadKeys.all, "list"] as const,
  list: (filters: string) => [...leadKeys.lists(), { filters }] as const,
  details: () => [...leadKeys.all, "detail"] as const,
  detail: (id: string) => [...leadKeys.details(), id] as const,
};

// Get Leads
export function useGetLeads(filters?: LeadFilterOptions) {
  return useQuery<GetLeadsRes>({
    queryKey: leadKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getLeads(filters || {}),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get Lead by ID
export function useGetLead(id: string, enabled = true) {
  return useQuery<GetLeadRes>({
    queryKey: leadKeys.detail(id),
    queryFn: () => getLead(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update lead mutation
export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLeadRequest }) =>
      updateLead(id, data),
    onSuccess: (_, variables) => {
      toast.success("Lead updated successfully");
      queryClient.invalidateQueries({ queryKey: leadKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: leadKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update lead");
    },
  });
}
