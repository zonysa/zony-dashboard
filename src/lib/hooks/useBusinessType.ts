import {
  BusinessTypeDetails,
  CreateBusinessTypeRes,
  GetBusinessTypesRes,
} from "@/lib/schema/businessType.schema";
import {
  createBusinessType,
  deleteBusinessType,
  getBusinessTypes,
  updateBusinessType,
} from "@/lib/services/businessType.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for consistency
export const businessTypeKeys = {
  all: ["business-types"] as const,
  lists: () => [...businessTypeKeys.all, "list"] as const,
  list: () => [...businessTypeKeys.lists()] as const,
  details: () => [...businessTypeKeys.all, "detail"] as const,
  detail: (id: string) => [...businessTypeKeys.details(), id] as const,
};

// Get Business Types Hook
export function useGetBusinessTypes() {
  return useQuery<GetBusinessTypesRes>({
    queryKey: businessTypeKeys.list(),
    queryFn: () => getBusinessTypes(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Create Business Type
export function useCreateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation<CreateBusinessTypeRes, Error, BusinessTypeDetails>({
    mutationFn: createBusinessType,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: businessTypeKeys.lists() });
      toast.success(`Business type "${response.business_type.name}" created successfully`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Creating business type failed. Please try again.");
    },
  });
}

// Update Business Type
export function useUpdateBusinessType() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { id: number; data: Partial<BusinessTypeDetails> }
  >({
    mutationFn: ({ id, data }) => updateBusinessType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessTypeKeys.lists() });
      toast.success("Business type updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Updating business type failed. Please try again.");
    },
  });
}

// Delete Business Type
export function useDeleteBusinessType() {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number>({
    mutationFn: deleteBusinessType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: businessTypeKeys.lists() });
      toast.success("Business type deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Deleting business type failed. Please try again.");
    },
  });
}
