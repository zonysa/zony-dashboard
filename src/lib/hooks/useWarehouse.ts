import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  BinParcelData,
  CheckoutParcelData,
  CourierCheckoutData,
  CourierDeliverData,
  CourierFailData,
  CourierReturnData,
  DeliverParcelData,
  FailParcelData,
  GetCourierManifestRes,
  GetFailureReasonsRes,
  GetLoadingManifestRes,
  GetParcelEventsRes,
  GetParcelRes,
  GetReportRes,
  GetReturnReconciliationRes,
  GetSettingsRes,
  GetSlotsRes,
  GetStateDiffRes,
  GetWallRes,
  GetZonesRes,
  ReturnParcelData,
  VoidEventData,
  WarehouseReportRange,
  WHParcelStatus,
  WHScanEventRes,
} from "@/lib/schema/warehouse.schema";
import {
  binParcel,
  checkoutParcel,
  courierCheckoutParcel,
  courierDeliverParcel,
  courierFailParcel,
  courierReturnParcel,
  deliverParcel,
  exportEventsCsv,
  exportParcelsCsv,
  failParcel,
  getCourierFailureReasons,
  getCourierManifest,
  getFailureReasons,
  getLoadingManifest,
  getParcel,
  getParcelEvents,
  getReport,
  getReturnReconciliation,
  getSettings,
  getSlots,
  getStateDiff,
  getWall,
  getZones,
  receivingScan,
  resendCode,
  returnParcel,
  scanBarcode,
  updateSetting,
  voidEvent,
} from "@/lib/services/warehouse.service";

// Query keys factory for consistency (staff + courier — the public /slots
// link is a separate unauthenticated page, not wired through here).
export const warehouseKeys = {
  all: ["warehouse"] as const,
  lists: () => [...warehouseKeys.all, "list"] as const,
  list: (filters: string) => [...warehouseKeys.lists(), { filters }] as const,
  details: () => [...warehouseKeys.all, "detail"] as const,
  detail: (id: string) => [...warehouseKeys.details(), id] as const,
  events: (id: string) => [...warehouseKeys.detail(id), "events"] as const,
  barcode: (barcode: string) =>
    [...warehouseKeys.all, "barcode", barcode] as const,

  // date/slot are optional so callers can invalidate the whole family with
  // just the prefix (e.g. `warehouseKeys.wall()`) without knowing every
  // date/slot combination currently cached.
  wall: (date?: string) =>
    date
      ? ([...warehouseKeys.all, "wall", date] as const)
      : ([...warehouseKeys.all, "wall"] as const),
  loadingManifest: (slotId?: string, date?: string) =>
    slotId && date
      ? ([...warehouseKeys.all, "loading", slotId, date] as const)
      : ([...warehouseKeys.all, "loading"] as const),
  returnRecon: (slotId?: string, date?: string) =>
    slotId && date
      ? ([...warehouseKeys.all, "return", slotId, date] as const)
      : ([...warehouseKeys.all, "return"] as const),

  slots: (includeInactive?: boolean) =>
    [...warehouseKeys.all, "slots", includeInactive ?? false] as const,
  zones: () => [...warehouseKeys.all, "zones"] as const,
  failureReasons: () => [...warehouseKeys.all, "failure-reasons"] as const,
  settings: () => [...warehouseKeys.all, "settings"] as const,
  report: (range: string) => [...warehouseKeys.all, "report", range] as const,
  stateDiff: () => [...warehouseKeys.all, "state-diff"] as const,

  courierManifest: (slotId?: string, date?: string) =>
    slotId && date
      ? ([...warehouseKeys.all, "courier-manifest", slotId, date] as const)
      : ([...warehouseKeys.all, "courier-manifest"] as const),
  courierFailureReasons: () =>
    [...warehouseKeys.all, "courier-failure-reasons"] as const,
};

// Mint an idempotency key once per USER ACTION — e.g. in a `useRef(() =>
// mintClientEventId())` seeded when a scan sheet/confirmation dialog opens —
// and reuse that same value across every resubmit of that one action. Never
// call this inline inside an onClick/mutate() call; see the contract note
// below for why that reintroduces the duplicate-scan bug.
export function mintClientEventId(): string {
  return crypto.randomUUID();
}

// ---------------------------------------------------------------------------
// Idempotency contract for every mutation below
// ---------------------------------------------------------------------------
// Every write requires `client_event_id`. The backend deduplicates on it: a
// retry carrying the SAME id gets back the original event with
// `created: false` (HTTP 200), not a 409 and not a second event.
//
// TanStack's own `retry` is safe here by construction: a retry re-invokes
// `mutationFn` with the exact `variables` object handed to the original
// `mutate()` call — it does not re-run whatever code built those variables.
// So as long as `client_event_id` is generated ONCE, before `mutate()` is
// called, and threaded through as part of `variables`, every automatic retry
// reuses it verbatim. That's precisely why these mutations turn retry ON
// below (`retry: 2` with backoff) instead of the "never retry a POST"
// default a lot of apps use — the idempotency key is what makes retrying
// safe, not something retry has to work around.
//
// The bug this guards against isn't TanStack retrying — it's a human
// retrying: a scan times out, the screen looks stuck, staff taps the button
// again. If a fresh `crypto.randomUUID()` gets minted inside that second
// tap's handler, the backend sees a brand-new client_event_id and cannot
// tell the two scans apart — duplicate event, the exact failure mode
// `client_event_id` exists to prevent.
//
// What this file does to enforce it: `client_event_id` is never generated
// or defaulted inside a mutationFn here — every *Data type requires it as a
// caller-supplied field, so the only way to call these hooks is to already
// have minted one (with `mintClientEventId()`) before `mutate()` runs.
// ---------------------------------------------------------------------------

// A scan mutation's response only carries the freshly-derived
// `parcel_status`, not the full parcel — patch just that field into the
// cache for an instant UI update, then invalidate everything the event
// could have moved (the parcel's own detail/events, the Wall, both
// manifests) so the next read is the real, server-derived state rather
// than a client-side guess.
function applyScanEventResult(
  queryClient: QueryClient,
  id: string,
  parcelStatus: WHParcelStatus,
) {
  queryClient.setQueryData<GetParcelRes>(warehouseKeys.detail(id), (old) =>
    old ? { ...old, parcel: { ...old.parcel, status: parcelStatus } } : old,
  );
  queryClient.invalidateQueries({ queryKey: warehouseKeys.detail(id) });
  queryClient.invalidateQueries({ queryKey: warehouseKeys.events(id) });
  queryClient.invalidateQueries({ queryKey: warehouseKeys.wall() });
  queryClient.invalidateQueries({ queryKey: warehouseKeys.loadingManifest() });
  queryClient.invalidateQueries({ queryKey: warehouseKeys.returnRecon() });
  queryClient.invalidateQueries({
    queryKey: warehouseKeys.courierManifest(),
  });
}

// `created: false` (a deduplicated retry) still lands here, in onSuccess —
// apiCall only rejects on an HTTP error, and a dedup replay is a 200. So
// this toast path is shared by both a fresh event and a deduplicated one
// on purpose: don't add a branch that turns `created: false` into an error.
function toastScanEventSuccess(data: WHScanEventRes) {
  toast.success(data.message);
}

// ---- Staff: receiving, scan resolution ----

export function useReceivingScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: receivingScan,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.wall() });
      if (data?.parcel?.id) {
        queryClient.setQueryData(warehouseKeys.detail(data.parcel.id), {
          status: "success",
          message: data.message,
          parcel: data.parcel,
        });
      }
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to receive parcel");
    },
  });
}

// Barcode resolution is a point-in-time lookup performed mid-scan, not data
// worth caching for reuse — staleTime/gcTime 0 so a second scan of the same
// barcode always hits the server, never a stale local result.
export function useScanBarcode(barcode: string, enabled = false) {
  return useQuery<GetParcelRes>({
    queryKey: warehouseKeys.barcode(barcode),
    queryFn: () => scanBarcode(barcode),
    enabled: !!barcode && enabled,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
}

// ---- Staff: the Wall & manifests (live operational screens) ----
//
// Refetch strategy: staleTime: 0 plus a 15s refetchInterval (foreground
// only — refetchIntervalInBackground defaults to false, so it doesn't poll
// a backgrounded tab). Nothing else in this codebase polls today (no other
// hook sets refetchInterval), but the Wall and both manifests are shared
// boards: multiple staff and couriers act on the same physical parcels from
// different screens at the same time, and status here is never something
// the client may treat as "probably still right" — it's the derived fold,
// re-computed by every event. A stale board isn't a caching nuance, it's an
// operator seeing a parcel as available to bin when a courier already
// checked it out. 15s keeps the board feeling live without hammering the
// backend on every one of these screens; navigation/refocus additionally
// forces a fresh read via staleTime: 0.

export function useGetWall(date: string) {
  return useQuery<GetWallRes>({
    queryKey: warehouseKeys.wall(date),
    queryFn: () => getWall(date),
    enabled: !!date,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetLoadingManifest(slotId: string, date: string) {
  return useQuery<GetLoadingManifestRes>({
    queryKey: warehouseKeys.loadingManifest(slotId, date),
    queryFn: () => getLoadingManifest(slotId, date),
    enabled: !!slotId && !!date,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetReturnReconciliation(slotId: string, date: string) {
  return useQuery<GetReturnReconciliationRes>({
    queryKey: warehouseKeys.returnRecon(slotId, date),
    queryFn: () => getReturnReconciliation(slotId, date),
    enabled: !!slotId && !!date,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ---- Staff: single parcel + its audit log ----
// staleTime: 0 for the same reason as the Wall — `status` is derived and
// must reflect the latest fold, not a 5-minute-old read.

export function useGetParcel(id: string, enabled = true) {
  return useQuery<GetParcelRes>({
    queryKey: warehouseKeys.detail(id),
    queryFn: () => getParcel(id),
    enabled: !!id && enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetParcelEvents(id: string, enabled = true) {
  return useQuery<GetParcelEventsRes>({
    queryKey: warehouseKeys.events(id),
    queryFn: () => getParcelEvents(id),
    enabled: !!id && enabled,
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ---- Staff: scan-event mutations (E02/E04/E05/E06/E07/X01) ----

export function useBinParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BinParcelData }) =>
      binParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to bin parcel");
    },
  });
}

export function useCheckoutParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CheckoutParcelData }) =>
      checkoutParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to check out parcel");
    },
  });
}

export function useDeliverParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DeliverParcelData }) =>
      deliverParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to deliver parcel");
    },
  });
}

export function useFailParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: FailParcelData }) =>
      failParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to record failed attempt");
    },
  });
}

export function useReturnParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnParcelData }) =>
      returnParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to return parcel");
    },
  });
}

export function useVoidEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: VoidEventData }) =>
      voidEvent(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to void event");
    },
  });
}

export function useResendCode() {
  return useMutation({
    mutationFn: ({ id, clientEventId }: { id: string; clientEventId: string }) =>
      resendCode(id, clientEventId),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to resend delivery code");
    },
  });
}

// ---- Staff: reference data & settings ----
// Zones/slots/failure reasons/settings aren't fold-derived — ordinary
// catalog data, so the standard 5-minute staleTime other domains use is fine
// here (unlike the Wall/manifests/parcel status above).

export function useGetSlots(includeInactive?: boolean) {
  return useQuery<GetSlotsRes>({
    queryKey: warehouseKeys.slots(includeInactive),
    queryFn: () => getSlots(includeInactive),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetZones() {
  return useQuery<GetZonesRes>({
    queryKey: warehouseKeys.zones(),
    queryFn: getZones,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetFailureReasons() {
  return useQuery<GetFailureReasonsRes>({
    queryKey: warehouseKeys.failureReasons(),
    queryFn: getFailureReasons,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetSettings() {
  return useQuery<GetSettingsRes>({
    queryKey: warehouseKeys.settings(),
    queryFn: getSettings,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: unknown }) =>
      updateSetting(key, value),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.settings() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update setting");
    },
  });
}

// ---- Staff: reporting ----

export function useGetReport(range: WarehouseReportRange, enabled = true) {
  return useQuery<GetReportRes>({
    queryKey: warehouseKeys.report(JSON.stringify(range)),
    queryFn: () => getReport(range),
    enabled: enabled && !!range.start && !!range.end,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useExportEventsCsv() {
  return useMutation({
    mutationFn: exportEventsCsv,
    onSuccess: (blob, range) => {
      downloadBlob(blob, `warehouse-events-${range.start}-${range.end}.csv`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to export events CSV");
    },
  });
}

export function useExportParcelsCsv() {
  return useMutation({
    mutationFn: exportParcelsCsv,
    onSuccess: (blob, range) => {
      downloadBlob(blob, `warehouse-parcels-${range.start}-${range.end}.csv`);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to export parcels CSV");
    },
  });
}

// The projector integrity alarm — checked fresh every time, never cached,
// since its entire purpose is catching drift as soon as possible.
export function useGetStateDiff(enabled = true) {
  return useQuery<GetStateDiffRes>({
    queryKey: warehouseKeys.stateDiff(),
    queryFn: getStateDiff,
    enabled,
    staleTime: 0,
    gcTime: 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// ---- Courier: /courier ----

export function useGetCourierManifest(slotId: string, date: string) {
  return useQuery<GetCourierManifestRes>({
    queryKey: warehouseKeys.courierManifest(slotId, date),
    queryFn: () => getCourierManifest(slotId, date),
    enabled: !!slotId && !!date,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCourierCheckoutParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourierCheckoutData }) =>
      courierCheckoutParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to check out parcel");
    },
  });
}

export function useCourierDeliverParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourierDeliverData }) =>
      courierDeliverParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to deliver parcel");
    },
  });
}

export function useCourierFailParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourierFailData }) =>
      courierFailParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to record failed attempt");
    },
  });
}

export function useCourierReturnParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CourierReturnData }) =>
      courierReturnParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to return parcel");
    },
  });
}

export function useGetCourierFailureReasons() {
  return useQuery<GetFailureReasonsRes>({
    queryKey: warehouseKeys.courierFailureReasons(),
    queryFn: getCourierFailureReasons,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
