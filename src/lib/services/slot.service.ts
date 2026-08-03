import {
  ConfirmSlotData,
  ConfirmSlotRes,
  GetSlotPageRes,
} from "@/lib/schema/slot.schema";
import { apiCall } from "@/lib/services/apiClient";

// Public, unauthenticated `/slots` endpoints (docs/warehouse-api.md §4.3).
// GET is read-only by contract — it must never be called from anywhere but
// the page-view query below. The confirm mutation is the only write, and it
// only ever runs from an explicit user tap (see useConfirmSlot in
// useSlot.ts / the confirm button in app/slot/page.tsx) — never from an
// effect, never on mount.

export const getSlotPage = async (token: string): Promise<GetSlotPageRes> => {
  return apiCall({
    method: "GET",
    url: "/slots/",
    params: { token },
  });
};

export const confirmSlot = async (
  token: string,
  data: ConfirmSlotData,
): Promise<ConfirmSlotRes> => {
  return apiCall({
    method: "POST",
    url: "/slots/confirm",
    params: { token },
    data,
  });
};
