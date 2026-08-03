import { z } from "zod";

import { WHParcelStatus } from "@/lib/schema/warehouse.schema";

// The public `/slots` link (no JWT) — GET /slots/?token=... and
// POST /slots/confirm?token=.... Kept as its own domain, separate from
// warehouse.schema.ts/service.ts/hook.ts, because it is the one
// unauthenticated surface in the module (docs/warehouse-api.md §4.3) and
// deliberately exposes only what the recipient already knows — see
// `_public_parcel()` in the backend's public_routes.py, the source of truth
// for this shape.

// Everything the recipient is shown about their own parcel. Note there is no
// scheduled date stored anywhere server-side — only `confirmed_slot_id` (a
// time window). Don't invent a "your delivery is on <date>" line; the API
// cannot back it.
export interface PublicWHParcel {
  recipient_name: string;
  barcode: string;
  status: WHParcelStatus;
  confirmed_slot_id: number | null;
  attempt_number: number;
}

// One selectable (date, slot) pair. `available_slots` is a flat list —
// each of the `scheduling_horizon_days` (default 3) days repeats the full
// slot catalog, so the same `slot_id` appears once per day with a different
// `date`. Group by `date` client-side.
export interface PublicSlotOption {
  slot_id: number;
  code: string;
  label_ar: string;
  label_en: string;
  date: string; // YYYY-MM-DD
  starts_at: string; // "HH:MM"
  ends_at: string; // "HH:MM"
  booked: number;
  capacity: number;
  over_capacity: boolean; // advisory only — never blocks a choice
}

export interface GetSlotPageRes {
  status: "success";
  message: string;
  parcel: PublicWHParcel;
  can_modify: boolean;
  // Empty whenever can_modify is false — the parcel is already on a van.
  available_slots: PublicSlotOption[];
}

export interface ConfirmSlotRes {
  status: "success";
  message: string;
  parcel: PublicWHParcel;
}

// slot_id is required-but-nullable server-side (marshmallow `allow_none`) —
// null is the explicit "clear my choice" action, not "field omitted".
export const confirmSlotSchema = z.object({
  slot_id: z.number().int().positive().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  client_event_id: z.string().min(8).max(64),
});
export type ConfirmSlotData = z.infer<typeof confirmSlotSchema>;
