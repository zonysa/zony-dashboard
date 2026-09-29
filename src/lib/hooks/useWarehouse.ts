import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  AcceptHandoverData,
  AssignParcelData,
  BinParcelData,
  BatchCreateData,
  BatchHandoverData,
  BatchMembershipData,
  BulkAssignData,
  CarrierWriteData,
  DispatchScanData,
  GetBatchesRes,
  GetBatchRes,
  GetCarriersRes,
  GetMerchantsRes,
  MerchantWriteData,
  WHBatchState,
  CheckoutParcelData,
  CourierCheckoutData,
  CourierDeliverData,
  CourierFailData,
  CourierReturnData,
  DeliverParcelData,
  FailParcelData,
  GetCourierManifestRes,
  GetCouriersRes,
  GetFailureReasonsRes,
  GetLoadingManifestRes,
  GetParcelEventsRes,
  GetParcelListRes,
  GetPudoReturnsRes,
  GetParcelRes,
  GetPendingHandoversRes,
  GetReportRes,
  GetReturnReconciliationRes,
  GetSettingsRes,
  GetSlotsRes,
  GetStateDiffRes,
  GetWallRes,
  GetWarehouseRes,
  GetWarehousesRes,
  GetWarehouseStaffCandidatesRes,
  GetWarehouseStaffRes,
  GetZonesRes,
  HandoverParcelData,
  ReceivingLookupMode,
  ReceivingPrefill,
  ReturnedToOriginData,
  ReturnReceivedData,
  ReturnParcelData,
  SendToRtoData,
  UnassignParcelData,
  VoidEventData,
  WarehouseReportRange,
  WarehouseUpdateData,
  WHParcel,
  WHParcelListFilters,
  WHParcelStatus,
  WHScanEventRes,
} from "@/lib/schema/warehouse.schema";
import {
  acceptHandover,
  assignParcel,
  assignWarehouseStaff,
  binParcel,
  createBatch,
  createCarrier,
  createMerchant,
  dispatchScan,
  getBatch,
  getBatches,
  getCarriers,
  getMerchants,
  handoverBatch,
  setParcelBatch,
  updateCarrier,
  updateMerchant,
  bulkAssign,
  checkoutParcel,
  createWarehouse,
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
  getCouriers,
  getFailureReasons,
  getLoadingManifest,
  getParcel,
  getParcelEvents,
  getPendingHandovers,
  getPudoReturns,
  getReport,
  getReturnReconciliation,
  getSettings,
  getSlots,
  getStateDiff,
  getWall,
  getWarehouse,
  getWarehouseStaff,
  getWarehouseStaffCandidates,
  getZones,
  handoverParcel,
  listParcels,
  listWarehouses,
  markReturnedToOrigin,
  receivingScan,
  resendCode,
  returnParcel,
  returnReceived,
  scanBarcode,
  sendToRto,
  unassignParcel,
  unassignWarehouseStaff,
  updateSetting,
  updateWarehouse,
  voidEvent,
} from "@/lib/services/warehouse.service";
import { ApiError } from "@/lib/services/apiClient";
import { getParcelById, getParcels } from "@/lib/services/parcel.service";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { parcelKeys } from "@/lib/hooks/useParcel";
import { normalizeSaudiPhone } from "@/lib/validators/phone";

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

  // date/slot/warehouse are optional so callers can invalidate the whole
  // family with just the prefix (e.g. `warehouseKeys.wall()`) without knowing
  // every combination currently cached.
  //
  // `warehouseId` comes FIRST after the noun and is never omitted when the
  // fuller key is built: two buildings' Walls are different boards, and a key
  // that ignored the warehouse would serve Riyadh's grid for Jeddah after a
  // switch — showing an operator boxes that are in another city.
  wall: (warehouseId?: number, date?: string) =>
    warehouseId && date
      ? ([...warehouseKeys.all, "wall", warehouseId, date] as const)
      : ([...warehouseKeys.all, "wall"] as const),
  loadingManifest: (warehouseId?: number, slotId?: string, date?: string) =>
    warehouseId && slotId && date
      ? ([...warehouseKeys.all, "loading", warehouseId, slotId, date] as const)
      : ([...warehouseKeys.all, "loading"] as const),
  returnRecon: (warehouseId?: number, slotId?: string, date?: string) =>
    warehouseId && slotId && date
      ? ([...warehouseKeys.all, "return", warehouseId, slotId, date] as const)
      : ([...warehouseKeys.all, "return"] as const),

  // Bucket/batch lists. Prefix `queue()` invalidates every filter combination.
  queue: (warehouseId?: number, filters?: WHParcelListFilters) =>
    warehouseId
      ? ([...warehouseKeys.all, "queue", warehouseId, filters ?? {}] as const)
      : ([...warehouseKeys.all, "queue"] as const),

  merchants: () => [...warehouseKeys.all, "merchants"] as const,
  carriers: () => [...warehouseKeys.all, "carriers"] as const,
  // `batches()` alone is the prefix for every list; `batch(id)` is one detail.
  batches: (warehouseId?: number, filters?: string) =>
    warehouseId
      ? ([...warehouseKeys.all, "batches", warehouseId, filters ?? ""] as const)
      : ([...warehouseKeys.all, "batches"] as const),
  batch: (id: number) => [...warehouseKeys.all, "batch", id] as const,

  pudoReturns: (warehouseId?: number) =>
    warehouseId
      ? ([...warehouseKeys.all, "pudo-returns", warehouseId] as const)
      : ([...warehouseKeys.all, "pudo-returns"] as const),

  slots: (includeInactive?: boolean) =>
    [...warehouseKeys.all, "slots", includeInactive ?? false] as const,
  // wh_zones belong to one building and codes repeat across buildings, so
  // this must be keyed per warehouse too.
  zones: (warehouseId?: number) =>
    warehouseId
      ? ([...warehouseKeys.all, "zones", warehouseId] as const)
      : ([...warehouseKeys.all, "zones"] as const),
  failureReasons: () => [...warehouseKeys.all, "failure-reasons"] as const,
  settings: () => [...warehouseKeys.all, "settings"] as const,
  report: (range: string) => [...warehouseKeys.all, "report", range] as const,
  stateDiff: () => [...warehouseKeys.all, "state-diff"] as const,

  // The buildings themselves.
  warehouses: (filters?: string) =>
    filters
      ? ([...warehouseKeys.all, "warehouses", filters] as const)
      : ([...warehouseKeys.all, "warehouses"] as const),
  warehouse: (id?: number) =>
    id
      ? ([...warehouseKeys.all, "warehouse", id] as const)
      : ([...warehouseKeys.all, "warehouse"] as const),
  warehouseStaff: (id?: number) =>
    id
      ? ([...warehouseKeys.all, "warehouse-staff", id] as const)
      : ([...warehouseKeys.all, "warehouse-staff"] as const),
  warehouseStaffCandidates: (id?: number) =>
    id
      ? ([...warehouseKeys.all, "warehouse-staff-candidates", id] as const)
      : ([...warehouseKeys.all, "warehouse-staff-candidates"] as const),

  // A shop's own inbox for admin/supervisor/responsible. `undefined` means
  // "mine" for a responsible, or "everyone's" for a global role -- both valid
  // states, so this key is never collapsed to a bare prefix the way wall/
  // manifest keys are.
  pendingHandovers: (pudoId?: number) =>
    [...warehouseKeys.all, "pending-handovers", pudoId ?? "all"] as const,

  courierManifest: (warehouseId?: number, slotId?: string, date?: string) =>
    warehouseId && slotId && date
      ? ([
          ...warehouseKeys.all,
          "courier-manifest",
          warehouseId,
          slotId,
          date,
        ] as const)
      : ([...warehouseKeys.all, "courier-manifest"] as const),
  courierFailureReasons: () =>
    [...warehouseKeys.all, "courier-failure-reasons"] as const,

  // The active-courier roster for a building, with per-warehouse assigned
  // counts. Keyed per warehouse — the counts differ site to site.
  couriers: (warehouseId?: number) =>
    warehouseId
      ? ([...warehouseKeys.all, "couriers", warehouseId] as const)
      : ([...warehouseKeys.all, "couriers"] as const),
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
  queryClient.invalidateQueries({ queryKey: warehouseKeys.queue() });
  queryClient.invalidateQueries({ queryKey: warehouseKeys.pudoReturns() });
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
export function useScanBarcode(
  barcode: string,
  warehouseId: number | null,
  enabled = false,
) {
  return useQuery<GetParcelRes>({
    queryKey: [...warehouseKeys.barcode(barcode), warehouseId] as const,
    queryFn: () => scanBarcode(barcode, warehouseId!),
    enabled: !!barcode && !!warehouseId && enabled,
    staleTime: 0,
    gcTime: 0,
    retry: 1,
  });
}

function prefillFromWarehouseParcel(parcel: WHParcel): ReceivingPrefill {
  return {
    source: "barcode",
    barcode: parcel.barcode,
    tracking_ref: parcel.tracking_ref ?? "",
    recipient_name: parcel.recipient_name,
    recipient_phone: normalizeSaudiPhone(parcel.recipient_phone ?? ""),
    address: parcel.address ?? {},
  };
}

function prefillFromMainParcel(parcel: ParcelDetails): ReceivingPrefill {
  const receiver = parcel.receiver;
  return {
    source: "tracking_ref",
    // The main system stamps its own barcode; reuse it so the clerk isn't
    // asked to invent one. E01 still validates it server-side.
    barcode: parcel.barcode ?? "",
    tracking_ref: parcel.tracking_number ?? "",
    recipient_name: receiver?.personal?.name ?? "",
    recipient_phone: normalizeSaudiPhone(
      receiver?.personal?.phone_number ?? "",
    ),
    address: {
      line1: receiver?.location?.address ?? "",
      district: receiver?.location?.district ?? "",
      city: receiver?.location?.city ?? "",
    },
  };
}

/**
 * Resolve one typed identifier into receiver details for the receiving form.
 *
 * Resolves `null` — not an error — when nothing matches: an unrecognised
 * barcode is the *normal* case at receiving (a box arriving for the first
 * time), so the screen should say "fill it in by hand", not show a failure.
 * Real transport/permission failures still reject.
 *
 * No toast here, unlike the mutations below: the two modes need different
 * wording for the same outcome, and the copy lives in the screen's i18n
 * namespace rather than in this hook.
 */
export function useReceivingLookup() {
  return useMutation<
    ReceivingPrefill | null,
    Error,
    { mode: ReceivingLookupMode; value: string; warehouseId: number }
  >({
    mutationFn: async ({ mode, value, warehouseId }) => {
      const query = value.trim();

      if (mode === "barcode") {
        try {
          // Scoped to the receiving building: barcodes are deliberately not
          // unique across warehouses, so an unscoped lookup could prefill this
          // form from another site's parcel.
          const res = await scanBarcode(query, warehouseId);
          return prefillFromWarehouseParcel(res.parcel);
        } catch (error) {
          if (!(error instanceof ApiError && error.status === 404)) throw error;
          // Not known to the warehouse yet — the clerk's scanner reads the
          // box's barcode either way, so fall back to the main /parcels
          // system, which filters on exact barcode equality server-side.
          const res = await getParcels({ barcode: query, limit: 2 });
          const match = res.parcels?.[0];
          if (!match) return null;
          const { parcel } = await getParcelById(String(match.id));
          return prefillFromMainParcel(parcel);
        }
      }

      // Exact tracking_number equality server-side — a near miss here would
      // silently overwrite the receiver block with a different customer's
      // details.
      const res = await getParcels({ tracking_number: query, limit: 2 });
      const match = res.parcels?.[0];
      if (!match) return null;

      // The search/list row is a restricted projection (no receiver block,
      // no barcode) — only GET /parcels/:id returns the full record the
      // prefill needs.
      const { parcel } = await getParcelById(String(match.id));
      return prefillFromMainParcel(parcel);
    },
    retry: false,
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

// `warehouseId` is null until the picker resolves one (a fetch of the
// building list, or the persisted choice rehydrating). Every hook below stays
// disabled until then rather than firing a request the server would answer
// with a 400 — an error toast on first paint, every time.

export function useGetWall(date: string, warehouseId: number | null) {
  return useQuery<GetWallRes>({
    queryKey: warehouseKeys.wall(warehouseId ?? undefined, date),
    queryFn: () => getWall(date, warehouseId!),
    enabled: !!date && !!warehouseId,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetLoadingManifest(
  slotId: string,
  date: string,
  warehouseId: number | null,
) {
  return useQuery<GetLoadingManifestRes>({
    queryKey: warehouseKeys.loadingManifest(
      warehouseId ?? undefined,
      slotId,
      date,
    ),
    queryFn: () => getLoadingManifest(slotId, date, warehouseId!),
    enabled: !!slotId && !!date && !!warehouseId,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Live list of parcels in an operational bucket (retry / rto / …). Polls like
// the Wall: the retry release cron and other clerks move parcels underneath us.
export function useListParcels(
  warehouseId: number | null,
  filters: WHParcelListFilters,
) {
  return useQuery<GetParcelListRes>({
    queryKey: warehouseKeys.queue(warehouseId ?? undefined, filters),
    queryFn: () => listParcels(warehouseId!, filters),
    enabled: !!warehouseId,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 15 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// One-shot barcode resolve for scan-to-act screens (the query variant above
// is for a screen that displays the parcel). The server's 409 for an
// ambiguous barcode surfaces as this mutation's error.
export function useResolveBarcode() {
  return useMutation({
    mutationFn: ({
      barcode,
      warehouseId,
    }: {
      barcode: string;
      warehouseId: number;
    }) => scanBarcode(barcode, warehouseId),
    onError: (error: Error) => {
      toast.error(error?.message || "Barcode not found");
    },
  });
}

// ---- 3PL dispatch ----

export function useGetMerchants() {
  return useQuery<GetMerchantsRes>({
    queryKey: warehouseKeys.merchants(),
    queryFn: getMerchants,
    staleTime: 60 * 1000,
    retry: 2,
  });
}

export function useGetCarriers() {
  return useQuery<GetCarriersRes>({
    queryKey: warehouseKeys.carriers(),
    queryFn: getCarriers,
    staleTime: 60 * 1000,
    retry: 2,
  });
}

export function useSaveMerchant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: MerchantWriteData }) =>
      id ? updateMerchant(id, data) : createMerchant(data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.merchants() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to save merchant");
    },
  });
}

export function useSaveCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: CarrierWriteData }) =>
      id ? updateCarrier(id, data) : createCarrier(data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.carriers() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to save carrier");
    },
  });
}

// 3PL intake (E01, flow_type=dispatch). Same idempotency contract as the
// receiving scan: created:false is a replay and still a success.
export function useDispatchScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DispatchScanData) => dispatchScan(data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.queue() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.wall() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to receive parcel");
    },
  });
}

export function useGetBatches(
  warehouseId: number | null,
  filters: { carrier_id?: number; state?: WHBatchState } = {},
) {
  return useQuery<GetBatchesRes>({
    queryKey: warehouseKeys.batches(
      warehouseId ?? undefined,
      JSON.stringify(filters),
    ),
    queryFn: () => getBatches(warehouseId!, filters),
    enabled: !!warehouseId,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      warehouseId,
      data,
    }: {
      warehouseId: number;
      data: BatchCreateData;
    }) => createBatch(warehouseId, data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.batches() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create batch");
    },
  });
}

export function useGetBatch(id: number | null) {
  return useQuery<GetBatchRes>({
    queryKey: warehouseKeys.batch(id ?? 0),
    queryFn: () => getBatch(id!),
    enabled: id != null && !Number.isNaN(id),
    staleTime: 0,
    gcTime: 60 * 1000,
    retry: 2,
  });
}

// D01 — add to / remove from a batch. Refreshes the open batch, the batch
// lists and the ready_to_dispatch queue.
export function useSetParcelBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BatchMembershipData }) =>
      setParcelBatch(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update batch");
    },
  });
}

// D02 for the whole batch. HTTP 200 even when some parcels fail, so the caller
// gets the breakdown back and must show `failed` — no error toast for that.
export function useHandoverBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: BatchHandoverData }) =>
      handoverBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: warehouseKeys.all });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to hand over batch");
    },
  });
}

export function useGetPudoReturns(warehouseId: number | null) {
  return useQuery<GetPudoReturnsRes>({
    queryKey: warehouseKeys.pudoReturns(warehouseId ?? undefined),
    queryFn: () => getPudoReturns(warehouseId!),
    enabled: !!warehouseId,
    staleTime: 0,
    gcTime: 60 * 1000,
    refetchInterval: 30 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// R00 — the parcel moves into the RTO queue once this lands.
export function useReturnReceived() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnReceivedData }) =>
      returnReceived(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to receive parcel back");
    },
  });
}

// R01 manual RTO.
export function useSendToRto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SendToRtoData }) =>
      sendToRto(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to send parcel to RTO");
    },
  });
}

// R02 — terminal: the merchant has the box back.
export function useMarkReturnedToOrigin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ReturnedToOriginData }) =>
      markReturnedToOrigin(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to mark parcel returned");
    },
  });
}

export function useGetReturnReconciliation(
  slotId: string,
  date: string,
  warehouseId: number | null,
) {
  return useQuery<GetReturnReconciliationRes>({
    queryKey: warehouseKeys.returnRecon(warehouseId ?? undefined, slotId, date),
    queryFn: () => getReturnReconciliation(slotId, date, warehouseId!),
    enabled: !!slotId && !!date && !!warehouseId,
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

// ---- Staff: courier assignment (E03) ----

// The active-courier roster for a building. Catalog-like data (an operator's
// courier list doesn't change mid-shift), so it uses the 5min/10min settings
// the other lookup lists share rather than the live-board polling.
export function useGetCouriers(warehouseId: number | null) {
  return useQuery<GetCouriersRes>({
    queryKey: warehouseKeys.couriers(warehouseId ?? undefined),
    queryFn: () => getCouriers(warehouseId!),
    enabled: !!warehouseId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// E03 assign/reassign. Same scan-event response and idempotency contract as
// bin/checkout — the assigned count per courier also shifts, so refresh the
// roster.
export function useAssignParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AssignParcelData }) =>
      assignParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.couriers() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to assign courier");
    },
  });
}

// E03 with a null courier — DELETE with a JSON body.
export function useUnassignParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UnassignParcelData }) =>
      unassignParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.couriers() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to unassign courier");
    },
  });
}

// Assign one courier to many parcels. Partial success is normal (each parcel
// is in `assigned` or `failed`, HTTP 200 either way), so the toast reports
// both counts rather than treating any failure as an error. The single
// client_event_id is a PREFIX the server expands per parcel, so one mint per
// user action stays idempotent under retry.
export function useBulkAssign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BulkAssignData) => bulkAssign(data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data) => {
      if (data.failed_count > 0) {
        toast.warning(
          `Assigned ${data.assigned_count}, ${data.failed_count} failed`,
        );
      } else {
        toast.success(`Assigned ${data.assigned_count} parcels`);
      }
      queryClient.invalidateQueries({ queryKey: warehouseKeys.couriers() });
      queryClient.invalidateQueries({
        queryKey: warehouseKeys.loadingManifest(),
      });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.wall() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to assign parcels");
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
      // E07 is where the server decides retry vs RTO. The Return desk words
      // those two outcomes itself (translated), so don't double-toast them.
      if (
        data.parcel_status !== "retry_scheduled" &&
        data.parcel_status !== "rto_pending"
      ) {
        toastScanEventSuccess(data);
      }
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to return parcel");
    },
  });
}

export function useHandoverParcel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HandoverParcelData }) =>
      handoverParcel(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toastScanEventSuccess(data);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
      // The shop's inbox now has one more entry, wherever it's cached.
      queryClient.invalidateQueries({
        queryKey: [...warehouseKeys.all, "pending-handovers"],
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to hand parcel to PUDO point");
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

// No retry, unlike the scan mutations: resend-code has no client_event_id to
// dedupe on, so an automatic retry would rotate the code again and send the
// customer a second message. The caller shows `data.delivery_code` once and
// must not store it.
export function useResendCode() {
  return useMutation({
    mutationFn: resendCode,
    retry: false,
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

export function useGetZones(warehouseId: number | null) {
  return useQuery<GetZonesRes>({
    queryKey: warehouseKeys.zones(warehouseId ?? undefined),
    queryFn: () => getZones(warehouseId!),
    enabled: !!warehouseId,
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

// ---- Warehouses (the buildings) ----
// Ordinary catalog data — a building's address changes rarely — so the
// standard 5-minute staleTime applies, unlike the fold-derived screens above.

export function useGetWarehouses(filters?: {
  city_id?: number;
  zone_id?: number;
  status?: string;
}) {
  return useQuery<GetWarehousesRes>({
    queryKey: warehouseKeys.warehouses(
      filters ? JSON.stringify(filters) : undefined,
    ),
    queryFn: () => listWarehouses(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetWarehouse(id: number | null) {
  return useQuery<GetWarehouseRes>({
    queryKey: warehouseKeys.warehouse(id ?? undefined),
    queryFn: () => getWarehouse(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateWarehouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWarehouse,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.warehouses() });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to create warehouse");
    },
  });
}

export function useUpdateWarehouse(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: WarehouseUpdateData) => updateWarehouse(id, data),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: warehouseKeys.warehouses() });
      queryClient.invalidateQueries({ queryKey: warehouseKeys.warehouse(id) });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to update warehouse");
    },
  });
}

export function useGetWarehouseStaff(id: number | null) {
  return useQuery<GetWarehouseStaffRes>({
    queryKey: warehouseKeys.warehouseStaff(id ?? undefined),
    queryFn: () => getWarehouseStaff(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useGetWarehouseStaffCandidates(id: number | null) {
  return useQuery<GetWarehouseStaffCandidatesRes>({
    queryKey: warehouseKeys.warehouseStaffCandidates(id ?? undefined),
    queryFn: () => getWarehouseStaffCandidates(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useAssignWarehouseStaff(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => assignWarehouseStaff(id, userId),
    onSuccess: (data) => {
      toast.success(data.message);
      // A move empties the other building's roster too, and there is no way
      // to know which from here — invalidate every roster, not just this one.
      queryClient.invalidateQueries({
        queryKey: warehouseKeys.warehouseStaff(),
      });
      // Candidate lists shift for every building at once: the person just
      // assigned leaves this one's list and their old site's "currently at"
      // label is now wrong everywhere else.
      queryClient.invalidateQueries({
        queryKey: warehouseKeys.warehouseStaffCandidates(),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to assign staff member");
    },
  });
}

export function useUnassignWarehouseStaff(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => unassignWarehouseStaff(id, userId),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({
        queryKey: warehouseKeys.warehouseStaff(),
      });
      // They are now unassigned, so they become a candidate everywhere.
      queryClient.invalidateQueries({
        queryKey: warehouseKeys.warehouseStaffCandidates(),
      });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to remove staff member");
    },
  });
}

// ---- The warehouse -> PUDO handoff (staff + PUDO responsible) ----
// Not warehouse-floor screens: gated on VIEW_PUDO_HANDOVERS/
// MANAGE_PUDO_HANDOVERS in the dashboard's RBAC, held by admin, supervisor
// and `responsible` -- not warehouse_clerk. See warehouse.service.ts.

// staleTime: 0, like the Wall -- this is a live queue two different actors
// (the courier who dropped a box, the shop signing for it) can change at any
// moment, and a stale count here is a shop wondering where a box went.
export function useGetPendingHandovers(pudoId?: number, enabled = true) {
  return useQuery<GetPendingHandoversRes>({
    queryKey: warehouseKeys.pendingHandovers(pudoId),
    queryFn: () => getPendingHandovers(pudoId),
    enabled,
    staleTime: 0,
    gcTime: 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useAcceptHandover() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AcceptHandoverData }) =>
      acceptHandover(id, data),
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onSuccess: (data, variables) => {
      toast.success(data.message);
      applyScanEventResult(queryClient, variables.id, data.parcel_status);
      queryClient.invalidateQueries({
        queryKey: [...warehouseKeys.all, "pending-handovers"],
      });
      // Acceptance just created a `parcels` row -- the merged Parcels page
      // (useGetParcelFeed, a different domain's cache) is stale the instant
      // this resolves.
      queryClient.invalidateQueries({ queryKey: [...parcelKeys.all, "feed"] });
    },
    onError: (error: Error) => {
      toast.error(error?.message || "Failed to accept handover");
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

export function useGetCourierManifest(
  slotId: string,
  date: string,
  warehouseId: number | null,
) {
  return useQuery<GetCourierManifestRes>({
    queryKey: warehouseKeys.courierManifest(
      warehouseId ?? undefined,
      slotId,
      date,
    ),
    queryFn: () => getCourierManifest(slotId, date, warehouseId!),
    enabled: !!slotId && !!date && !!warehouseId,
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
