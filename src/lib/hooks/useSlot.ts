import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ConfirmSlotData, GetSlotPageRes } from "@/lib/schema/slot.schema";
import { ApiError } from "@/lib/services/apiClient";
import { confirmSlot, getSlotPage } from "@/lib/services/slot.service";

export const slotKeys = {
  all: ["slot-page"] as const,
  page: (token: string) => [...slotKeys.all, token] as const,
};

// 400 (bad/expired token), 404 (parcel gone) and 429 (rate limit) are all
// deterministic for a given token — retrying immediately just burns the
// customer's own rate-limit budget. Only retry on a genuine transient
// failure (network blip, 5xx).
function shouldRetry(failureCount: number, error: Error) {
  if (failureCount >= 2) return false;
  return !(error instanceof ApiError) || error.status >= 500;
}

// GET is the one call this page makes on mount — safe by contract, since
// docs/warehouse-api.md §4.3 guarantees it's read-only (link-preview bots
// hit it too). Never wire a mutation to fire from this hook or from an
// effect keyed off its data.
export function useGetSlotPage(token: string) {
  return useQuery<GetSlotPageRes, Error>({
    queryKey: slotKeys.page(token),
    queryFn: () => getSlotPage(token),
    enabled: !!token,
    staleTime: 0,
    gcTime: 60 * 1000,
    retry: shouldRetry,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
}

// The only write on this page, and it must only ever be invoked from a
// direct user tap on the confirm button — see app/slot/page.tsx. Never call
// mutate()/mutateAsync() from a useEffect.
export function useConfirmSlot(token: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfirmSlotData) => confirmSlot(token, data),
    retry: 0,
    onSuccess: () => {
      // Re-derive from the server rather than patching the cache by hand —
      // this refetch is a GET (still read-only) and it's the only way to
      // pick up the fresh advisory capacity numbers on available_slots.
      queryClient.invalidateQueries({ queryKey: slotKeys.page(token) });
    },
  });
}
