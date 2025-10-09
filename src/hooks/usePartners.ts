import { Partner } from "@/lib/schema/partners.schema";
import { apiPartnerService } from "@/lib/services/partners/parnters.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Create Partner mutation
export const useCreatePartner = () => {
  //   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<Partner, "id">) =>
      apiPartnerService.createPartner(data),
    onSuccess: () => {
      // Invalidate and refetch partners list
      //   queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      //   queryClient.invalidateQueries({ queryKey: partnerKeys.stats() });
      toast.success("Partner created successfully");
      console.log("From mutation function");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create partner");
    },
  });
};
