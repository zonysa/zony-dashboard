import { z } from "zod";

import { saudiPhoneSchema } from "@/lib/validators/phone";

// Staff (admin/supervisor/responsible) and courier blueprints only.
// The public `/slots` link (no JWT, customer-facing) is a separate,
// unauthenticated page and is out of scope for this service/hook pair.

// ---- Derived parcel status ----
// Never stored — folded server-side from wh_events on every read/write.
// See docs/warehouse-api.md §1: never cache or compute this client-side.
export type WHParcelStatus =
  | "not_received"
  | "awaiting_scheduling"
  | "scheduled"
  | "needs_rebin"
  | "ready_for_dispatch"
  | "out_for_delivery"
  | "attempt_failed"
  | "delivered"
  // The courier says the box is at a PUDO point; the shop hasn't confirmed.
  // Not terminal — a shop may refuse it, and E07 brings it back.
  | "handed_to_pudo"
  // The shop signed for it. Terminal HERE, not in the business: the PUDO
  // flow owns the last mile from this point via the `parcels` row the
  // handoff created.
  | "at_pudo";

export type WHEventCode =
  | "E01"
  | "T01"
  | "E02"
  | "E04"
  | "E05"
  | "E06"
  | "E07"
  | "E08"
  | "E09"
  | "X01";

export interface WHAddress {
  line1?: string;
  district?: string;
  city?: string;
  notes?: string;
}

export interface WHParcel {
  id: string;
  barcode: string;
  tracking_ref: string | null;
  recipient_name: string;
  recipient_phone: string;
  address: WHAddress;
  zone_id: number | null;
  // The PLANNED last mile, set at intake. Null means home delivery — what
  // every parcel was before this existed. A courier may still divert to a
  // different shop at handover; this is a default, not the outcome.
  destination_pudo_id: number | null;
  experiment_arm: "treatment" | "control";
  created_at: string;

  // Derived fold state — write straight through from the response, never merge.
  status: WHParcelStatus;
  epoch: number;
  attempt_number: number;
  confirmed_slot_id: number | null;
  binned_slot_id: number | null;
  bin_code: string | null;
  customer_interacted: boolean;
  // The shop this box was ACTUALLY handed to, in the current epoch. Distinct
  // from destination_pudo_id above — set only once an E08 has fired, and
  // cleared by E01/E07 like the rest of the epoch-scoped fields.
  pudo_id: number | null;
}

export interface WHEvent {
  id: number;
  code: WHEventCode;
  occurred_at: string;
  slot_id?: number | null;
  reason_code?: string | null;
  notes?: string | null;
  voids_event_id?: number | null;
  // Which shop an E08/E09 names. Null for every other code.
  pudo_id?: number | null;
}

export interface WHWallSlot {
  slot_id: number;
  code: string;
  label_ar: string;
  label_en: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
}

export interface WHWallEntry {
  parcel_id: string;
  barcode: string;
  recipient_name: string;
  zone_id: number | null;
  status: WHParcelStatus;
  attempt_number: number;
  customer_interacted: boolean;
  bin_code: string | null;
  stale_slot?: boolean;
}

export interface WHWallCell {
  zone_id: number;
  slot_id: number;
  count: number;
  parcels: WHWallEntry[];
}

export interface GetWallRes {
  status: "success";
  date: string;
  slots: WHWallSlot[];
  cells: WHWallCell[];
  awaiting_scheduling: WHWallEntry[];
  awaiting_count: number;
}

export interface WHZone {
  id: number;
  name: string;
}

export interface GetZonesRes {
  status: "success";
  zones: WHZone[];
}

// ---- Warehouses (the buildings themselves) ----
// A `wh_warehouses` row: a real building, located in a main-flow `city` and
// optionally a `zone`. Note the two unrelated "zone" concepts — `WHWarehouse.
// zone_id` is a main-flow operations zone, while `WHZone` above is a delivery
// -area label used to group the Wall. They are not interchangeable.

export type WHWarehouseStatus = "active" | "inactive" | "suspended";

export interface WHWarehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  coordinates: { latitude: number; longitude: number } | null;
  phone_number: string | null;
  status: WHWarehouseStatus;
  city_id: number;
  zone_id: number | null;
  manager_id: string | null;
  // Resolved server-side so a list doesn't need a second lookup per row.
  city_name: string | null;
  zone_name: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GetWarehousesRes {
  status: "success";
  message: string;
  warehouses: WHWarehouse[];
}

export interface GetWarehouseRes {
  status: "success";
  message: string;
  warehouse: WHWarehouse;
}

// A roster row. `warehouse_clerk` is Zony's own floor staff, pinned to exactly
// one building; admin/supervisor run every site and never appear here, and
// `responsible` is a partner's PUDO person who is refused outright.
export interface WHWarehouseStaffMember {
  user_id: string;
  username: string;
  email: string;
  phone_number: string;
  role: string | null;
  assigned_at: string;
}

export interface GetWarehouseStaffRes {
  status: "success";
  message: string;
  warehouse_id: number;
  staff: WHWarehouseStaffMember[];
}

// Someone who could be assigned here. `current_warehouse_*` is null for a
// clerk with no building yet, and names another site for one who would be
// MOVED — a person has exactly one warehouse, so assigning empties whichever
// roster they are on now.
export interface WHWarehouseStaffCandidate {
  user_id: string;
  username: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  current_warehouse_id: number | null;
  current_warehouse_name: string | null;
}

export interface GetWarehouseStaffCandidatesRes {
  status: "success";
  message: string;
  warehouse_id: number;
  candidates: WHWarehouseStaffCandidate[];
}

export interface AssignWarehouseStaffRes {
  status: "success";
  message: string;
  user_id: string;
  warehouse_id: number;
  previous_warehouse_id: number | null;
  // True when the person already worked at another building. The API moves
  // them rather than erroring — one warehouse per person is a DB constraint.
  moved: boolean;
}

export interface WHSlotCatalogEntry {
  id: number;
  code: string;
  label_ar: string;
  label_en: string;
  starts_at: string;
  ends_at: string;
  capacity: number;
  is_active: boolean;
}

export interface GetSlotsRes {
  status: "success";
  slots: WHSlotCatalogEntry[];
}

export interface WHFailureReason {
  reason_code: string;
  name_ar: string;
  name_en: string;
}

export interface GetFailureReasonsRes {
  status: "success";
  reasons: WHFailureReason[];
}

export interface GetLoadingManifestRes {
  status: "success";
  slot_id: number;
  date: string;
  count: number;
  parcels: WHWallEntry[];
}

// A parcel sitting in the return desk's outstanding queue. `needs` is the
// server's human-readable statement of the next required action — render it
// as-is, but gate which action button is enabled off `status` against the
// LEGAL_PREDECESSORS table (docs/warehouse-api.md §2), same as the Wall's
// bin action: out_for_delivery must take an E06 (with a reason code) before
// an E07 return will be accepted; only attempt_failed may take the E07.
export interface WHReturnEntry extends WHWallEntry {
  needs: string | null;
}

// Count-out vs count-back reconciliation for one slot/date.
export interface GetReturnReconciliationRes {
  status: "success";
  slot_id: number;
  date: string;
  counted_out: number;
  delivered: number;
  outstanding: WHReturnEntry[];
}

export interface GetParcelRes {
  status: "success";
  message: string;
  parcel: WHParcel;
}

export interface GetParcelEventsRes {
  status: "success";
  parcel: WHParcel;
  events: WHEvent[];
}

// ---- The warehouse -> PUDO handoff ----
// See CLAUDE.md's "warehouse -> PUDO" section for the two-scan model this
// mirrors: E08 (courier drops it, one-sided claim) then E09 (the shop signs,
// which is what actually moves the box into the PUDO flow).

// One row of a shop's own inbox — GET /warehouse/pudo-handovers. Scoped
// server-side to the caller's own shop for a `responsible`; admin/supervisor
// may see every pending handoff or filter with `?pudo_id=`.
export interface WHPendingHandover {
  parcel_id: string;
  barcode: string;
  recipient_name: string;
  recipient_phone: string;
  address: WHAddress;
  pudo_id: number;
  pudo_name: string | null;
  courier_id: string | null;
  handed_over_at: string | null;
}

export interface GetPendingHandoversRes {
  status: "success";
  message: string;
  count: number;
  handovers: WHPendingHandover[];
}

// The PUDO-flow parcel the acceptance created (or found, if this call is a
// replay of an earlier acceptance). Deliberately does NOT carry
// receiving_code — that goes to the customer by SMS, never to whoever is
// holding the shop's screen.
export interface AcceptedHandoverParcel {
  id: number;
  tracking_number: string;
  status: string;
  pudo_id: number | null;
}

export interface AcceptHandoverRes {
  status: "success";
  message: string;
  created: boolean;
  event: WHEvent;
  parcel_status: WHParcelStatus;
  // Null only if something upstream went wrong — a successful accept always
  // has a bridged parcel to show.
  parcel: AcceptedHandoverParcel | null;
  customer_notified: boolean;
}

// The shared shape returned by every scan mutation (E02/E04/E05/E06/E07/X01).
// `parcel_status` is the single value a mutation hook is allowed to write
// into the cache — it's the just-recomputed fold result, not a guess.
export interface WHScanEventRes {
  status: "success";
  message: string;
  created: boolean;
  event: WHEvent;
  parcel_status: WHParcelStatus;
}

export interface WHReceivingScanRes {
  status: "success";
  message: string;
  created: boolean;
  parcel: WHParcel;
  delivery_code?: string;
  message_sent: boolean;
  message_channel: string;
  message_status: string;
}

export interface WHResendCodeRes {
  status: "success";
  message: string;
  message_sent: boolean;
  message_channel: string;
  message_status: string;
}

// Backend returns settings as a flat `{key: value}` map (see
// WarehouseSettingsService.get_all()), not a list of entries.
export interface GetSettingsRes {
  status: "success";
  message: string;
  settings: Record<string, unknown>;
}

export interface UpdateSettingRes {
  status: "success";
  message: string;
  key: string;
  value: unknown;
}

export interface WHReport {
  range: { start: string; end: string };
  volume_and_success: {
    parcels_received: number;
    parcels_attempted: number;
    first_attempt_success: number;
    first_attempt_success_rate: number | null;
  };
  by_customer_interaction: Array<{
    customer_interacted: 0 | 1;
    parcels_attempted: number;
    first_attempt_success_rate: number | null;
  }>;
  failure_reasons: Array<WHFailureReason & { count: number }>;
  dwell_time: {
    parcels: number;
    avg_minutes: number;
    median_minutes: number;
    p90_minutes: number;
    histogram: Record<string, number>;
  };
  messages: {
    by_channel: Array<{
      channel: string;
      total: number;
      failed: number;
      fallbacks: number;
      responded: number;
    }>;
    overall: Record<string, unknown>;
  };
  // Render next to the interacted/not-interacted split — see API doc §4.1.
  caveat: string;
}

export type GetReportRes = WHReport & { status: "success" };

export interface GetStateDiffRes {
  status: "success";
  drift: unknown[];
}

// ---- Courier ----
export interface WHCourierManifestEntry {
  parcel_id: string;
  barcode: string;
  recipient_name: string;
  recipient_phone: string;
  address: WHAddress;
  zone_id: number | null;
  status: WHParcelStatus;
  bin_code: string | null;
  attempt_number: number;
}

export interface GetCourierManifestRes {
  status: "success";
  slot_id: number;
  date: string;
  count: number;
  parcels: WHCourierManifestEntry[];
}

// ---- Filters ----
export interface WarehouseReportRange {
  start: string; // mandatory, server caps the span at 92 days
  end: string;
}

// ---- Request schemas ----
// Every write endpoint requires client_event_id (8–64 chars, unique-indexed
// server-side). It must be minted once per user action, not per HTTP
// attempt — see useWarehouse.ts for how the mutation hooks enforce that.
const clientEventIdSchema = z
  .string()
  .min(8, "client_event_id must be at least 8 characters")
  .max(64, "client_event_id must be at most 64 characters");

const addressSchema = z.object({
  line1: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

export const receivingScanSchema = z.object({
  // Which building took the box in. The server resolves this through its
  // access policy rather than trusting it: a `responsible` clerk is pinned to
  // one warehouse and a body naming a different one is refused, while an
  // admin/supervisor has nothing to derive it from and must send it. The UI
  // always sends the selected warehouse, which satisfies both.
  warehouse_id: z.number().int().positive(),
  barcode: z.string().min(1, "Barcode is required"),
  tracking_ref: z.string().optional(),
  recipient_name: z.string().min(1, "Recipient name is required"),
  recipient_phone: saudiPhoneSchema,
  address: addressSchema,
  zone_id: z.number().int().positive().optional(),
  // PLANNED last mile — a shop rather than the recipient's own door. Optional;
  // omitting it means home delivery, same as every parcel before this existed.
  destination_pudo_id: z.number().int().positive().optional(),
  experiment_arm: z.enum(["treatment", "control"]).default("treatment"),
  client_event_id: clientEventIdSchema,
});
export type ReceivingScanData = z.infer<typeof receivingScanSchema>;

// ---- Receiving-screen lookup ----
// The receiving form takes one identifier, and which module can answer for it
// depends on what kind it is: a barcode belongs to this module (a box already
// received once, e.g. one coming back after E07), while a tracking reference
// belongs to the main /parcels system, which knows nothing about wh_parcels.
// Both are normalized to the shape below so the form only has one thing to
// apply. This copies text into a new E01 — it creates no link between the two
// modules, and nothing here is persisted as a reference (docs/warehouse-api.md §1).
export type ReceivingLookupMode = "barcode" | "tracking_ref";

export interface ReceivingPrefill {
  source: ReceivingLookupMode;
  barcode: string;
  tracking_ref: string;
  recipient_name: string;
  /** Local 9-digit form (no +966) — what PhoneInput and saudiPhoneSchema expect. */
  recipient_phone: string;
  address: WHAddress;
}

export const binParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  slot_id: z.number().int().positive(),
  bin_code: z.string().min(1, "Bin code is required"),
  notes: z.string().max(500).optional(),
});
export type BinParcelData = z.infer<typeof binParcelSchema>;

export const checkoutParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  courier_id: z.string().uuid("Invalid courier ID"),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type CheckoutParcelData = z.infer<typeof checkoutParcelSchema>;

export const deliverParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  delivery_code: z.string().min(1, "Delivery code is required"),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type DeliverParcelData = z.infer<typeof deliverParcelSchema>;

export const failParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  reason_code: z.string().min(1, "Reason code is required"),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type FailParcelData = z.infer<typeof failParcelSchema>;

export const returnParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type ReturnParcelData = z.infer<typeof returnParcelSchema>;

// E08 — courier hands the box to a PUDO point. `pudo_id` is optional: the
// parcel's own destination_pudo_id is the default, and sending one overrides
// it for a diversion (the planned shop was shut, the customer asked for a
// different one).
export const handoverParcelSchema = z.object({
  client_event_id: clientEventIdSchema,
  pudo_id: z.number().int().positive().optional(),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type HandoverParcelData = z.infer<typeof handoverParcelSchema>;

// E09 — the shop signs for it. `pudo_id` here is a CHECK, not a choice: the
// server compares it against the shop the courier actually named on the E08
// and refuses a mismatch, so a signature can't be forged for a box that never
// arrived. Leave it unset unless the caller has a specific id to verify.
export const acceptHandoverSchema = z.object({
  client_event_id: clientEventIdSchema,
  pudo_id: z.number().int().positive().optional(),
  occurred_at: z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
});
export type AcceptHandoverData = z.infer<typeof acceptHandoverSchema>;

export const voidEventSchema = z.object({
  client_event_id: clientEventIdSchema,
  voids_event_id: z.number().int().positive(),
  void_reason: z.string().min(1, "Void reason is required"),
});
export type VoidEventData = z.infer<typeof voidEventSchema>;

// ---- Warehouse admin ----

const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const warehouseCreateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  code: z.string().trim().min(1, "Code is required").max(20),
  address: z.string().trim().min(1, "Address is required").max(255),
  coordinates: coordinatesSchema.nullable().optional(),
  phone_number: saudiPhoneSchema.optional().or(z.literal("")),
  // No zod `.default()` here on purpose. A default makes the field optional on
  // input but required on output, which splits the form's value type in two
  // and forces the 3-generic `useForm` dance the receiving form needs. The
  // forms always seed this from `defaultValues`, so the default bought nothing.
  status: z.enum(["active", "inactive", "suspended"]),
  city_id: z.number().int().positive("City is required"),
  zone_id: z.number().int().positive().nullable().optional(),
  manager_id: z.string().nullable().optional(),
});
export type WarehouseCreateData = z.infer<typeof warehouseCreateSchema>;

// PATCH sends only what changed, so every field is optional.
export const warehouseUpdateSchema = warehouseCreateSchema.partial();
export type WarehouseUpdateData = z.infer<typeof warehouseUpdateSchema>;

export const assignWarehouseStaffSchema = z.object({
  user_id: z.string().min(1, "Select a staff member"),
});
export type AssignWarehouseStaffData = z.infer<
  typeof assignWarehouseStaffSchema
>;

export const courierCheckoutSchema = checkoutParcelSchema;
export type CourierCheckoutData = CheckoutParcelData;

export const courierDeliverSchema = deliverParcelSchema;
export type CourierDeliverData = DeliverParcelData;

export const courierFailSchema = failParcelSchema;
export type CourierFailData = FailParcelData;

export const courierReturnSchema = returnParcelSchema;
export type CourierReturnData = ReturnParcelData;
