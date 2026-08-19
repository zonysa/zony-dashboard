import {
  GetSiteContentSectionRes,
  GetSiteContentSectionsRes,
  UpdateSiteContentPayload,
} from "@/lib/schema/siteContent.schema";
import {
  getSiteContentSection,
  getSiteContentSections,
  updateSiteContentSection,
} from "@/lib/services/siteContent.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const siteContentKeys = {
  all: ["site-content"] as const,
  lists: () => [...siteContentKeys.all, "list"] as const,
  details: () => [...siteContentKeys.all, "detail"] as const,
  detail: (sectionKey: string) => [...siteContentKeys.details(), sectionKey] as const,
};

export function useSiteContentSections() {
  return useQuery<GetSiteContentSectionsRes>({
    queryKey: siteContentKeys.lists(),
    queryFn: () => getSiteContentSections(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useSiteContentSection(sectionKey: string | null) {
  return useQuery<GetSiteContentSectionRes>({
    queryKey: siteContentKeys.detail(sectionKey ?? ""),
    queryFn: () => getSiteContentSection(sectionKey as string),
    enabled: !!sectionKey,
  });
}

export function useUpdateSiteContentSection() {
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    Error,
    { sectionKey: string; data: UpdateSiteContentPayload }
  >({
    mutationFn: ({ sectionKey, data }) => updateSiteContentSection(sectionKey, data),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: siteContentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: siteContentKeys.detail(variables.sectionKey),
      });
      toast.success("Content section updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Updating content section failed. Please try again.");
    },
  });
}
