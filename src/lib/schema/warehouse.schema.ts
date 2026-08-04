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
  | "delivered";

export type WHEventCode =
  | "E01"
  | "T01"
  | "E02"
  | "E04"
  | "E05"
  | "E06"
  | "E07"
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
}

export interface WHEvent {
  id: number;
  code: WHEventCode;
  occurred_at: string;
  slot_id?: number | null;
  reason_code?: string | null;
  notes?: string | null;
  voids_event_id?: number | null;
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

export interface WHSettingEntry {
  key: string;
  value: unknown;
}

export interface GetSettingsRes {
  status: "success";
  settings: WHSettingEntry[];
}

export interface UpdateSettingRes {
  status: "success";
  message: string;
  setting: WHSettingEntry;
}

export interface WHReport {
  range: { start: string; end: string };
  volume_and_success: {
    parcels_received: number;
    parcels_attempted: number;
    first_attempt_success: number;
    first_attempt_success_rate: number;
  };
  by_customer_interaction: Array<{
    customer_interacted: 0 | 1;
    parcels_attempted: number;
    first_attempt_success_rate: number;
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
  barcode: z.string().min(1, "Barcode is required"),
  tracking_ref: z.string().optional(),
  recipient_name: z.string().min(1, "Recipient name is required"),
  recipient_phone: saudiPhoneSchema,
  address: addressSchema,
  zone_id: z.number().int().positive().optional(),
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

export const voidEventSchema = z.object({
  client_event_id: clientEventIdSchema,
  voids_event_id: z.number().int().positive(),
  void_reason: z.string().min(1, "Void reason is required"),
});
export type VoidEventData = z.infer<typeof voidEventSchema>;

export const courierCheckoutSchema = checkoutParcelSchema;
export type CourierCheckoutData = CheckoutParcelData;

export const courierDeliverSchema = deliverParcelSchema;
export type CourierDeliverData = DeliverParcelData;

export const courierFailSchema = failParcelSchema;
export type CourierFailData = FailParcelData;

export const courierReturnSchema = returnParcelSchema;
export type CourierReturnData = ReturnParcelData;
