import z from "zod";

import { saudiPhoneSchema } from "@/lib/validators/phone";

// The statuses Parcel.status actually takes on the backend (see
// ParcelUpdateSchema/ParcelPolicy) — not the same set of values as this
// app's other domains, and used to double as codes on the tracking timeline.
export type ParcelStatus =
  | "pending"
  | "courier_received"
  | "waiting_confirmation"
  | "PUDO_received"
  | "customer_received"
  | "expired"
  | "expired_received";

// Delivery address type
export interface DeliveryAddress {
  address_type: string;
  date: string;
  from_time: string;
  to_time: string;
  location: {
    latitude: number;
    longitude: number;
  };
  short_address: string;
}

// Sender/receiver party snapshot (personal + location)
export interface PartyPersonal {
  name: string;
  phone_number: string;
  email?: string | null;
}

export interface PartyLocation {
  address?: string;
  city: string;
  zone: string;
  latitude: number;
  longitude: number;
  // National Address (SPL) enrichment — resolved server-side from
  // short_address or from the picked map coordinates.
  short_address?: string;
  district?: string;
  postal_code?: string;
  building_number?: string;
  additional_number?: string;
}

export interface ParcelParty {
  personal: PartyPersonal;
  location?: PartyLocation | null;
}

// What's inside the parcel
export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit?: "cm" | "in";
}

export interface ParcelContent {
  description: string;
  size?: "small" | "medium" | "large" | "extra_large";
  quantity?: number;
  weight?: number;
  dimensions?: Dimensions | null;
}

// Type for parcel details
export type ParcelDetails = {
  barcode: string;
  /** Same value as `barcode` — the list projection only returns this alias. */
  parcel_barcode?: string;
  city_name: string | null;
  client_name: string | null;
  courier_id: string | null;
  courier_name: string | null;
  courier_phone_number: string | null;
  courier_email: string | null;
  created_at: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone_number: string | null;
  delivering_date: string | null;
  delivery_address: DeliveryAddress | null;
  delivery_method: string;
  id: number;
  images: Record<string, unknown> | null;
  is_ticketed: boolean;
  pickup_period: number;
  pudo_id: number | null;
  receiving_code: string | null;
  receiving_date: string | null;
  sender: ParcelParty | null;
  receiver: ParcelParty | null;
  content: ParcelContent | null;
  status: ParcelStatus;
  tracking_number: string;
  updated_at: string;
  zone_name: string | null;
};

// Type for the getParcel API response
export type GetParcelRes = {
  message: string;
  parcel: ParcelDetails;
  status: "success" | "error";
};

// Type for the createParcel API response (same shape as GetParcelRes)
export type CreateParcelRes = {
  message: string;
  parcel: ParcelDetails;
  status: "success" | "error";
};

// A single status change recorded for a parcel, returned by
// GET /parcels/:id/tracking. `code` is typically one of ParcelDetails["status"]
// but is left as `string` since the backend may add finer-grained tracking
// codes without a matching parcel-level status.
export interface ParcelTrackingEvent {
  id: number;
  code: string;
  occurred_at: string;
  location?: string | null;
  notes?: string | null;
}

// Type for the getParcelTracking API response
export type GetParcelTrackingRes = {
  message: string;
  events: ParcelTrackingEvent[];
  status: "success" | "error";
};

// Type for the complete API response
export type getParcelsRes = {
  current_page: number;
  message: string;
  next_page: number | null;
  parcels: ParcelDetails[];
  prev_page: number | null;
  status: "success" | "error";
  total_pages: number;
  total_parcels: number;
};

// --- the cross-flow list ---------------------------------------------------
//
// Zony runs two parcel flows that share no tables: the PUDO flow (`parcels`)
// and the warehouse module (`wh_parcels`). The Parcels page shows both, so a
// row here can come from either and several columns are null in one of them —
// a warehouse parcel has no tracking number, client or PUDO; a PUDO parcel has
// no warehouse. `flow` says which, and is what row-click routes on.

export type ParcelFlow = "pudo" | "warehouse";

/**
 * How a parcel travels. Two distinct questions live in this one column:
 *
 * - `route` — the places it passes through, collapsed into one short code.
 * - `route_source` — whether that is a *planned* route (what was booked) or an
 *   *observed* one (where staff actually scanned it) — `observed` as soon as
 *   ANY leg in `legs` below is a real scan. They disagree in practice: a
 *   parcel booked straight to a customer still passes through a warehouse if a
 *   clerk receives it there.
 *
 * `unknown` is a real, common value rather than a defensive fallback — every
 * PUDO parcel created before this feature has neither a delivery method nor a
 * PUDO, and guessing "direct" for those would invent a fact.
 */
export type ParcelRoute =
  | "customer_direct"
  | "pudo_customer"
  | "warehouse_customer"
  | "warehouse_pudo_customer"
  | "unknown";

export type ParcelRouteSource = "observed" | "planned" | "unknown";

/** A place a leg names. Matches the warehouse module's own vocabulary. */
export type ParcelLegPlaceType = "warehouse" | "pudo" | "customer";
export type ParcelLegSource = "planned" | "observed";

/**
 * One stop in a parcel's journey — the backend's ItineraryService derives
 * these from the event log, never stores them. `source` is what makes this
 * trustworthy to render as a timeline rather than a guess: `observed` is a
 * scan that happened, `planned` is a booking or a not-yet-confirmed default
 * (see `place_id`/`place_name` both null on an unassigned "will go via a
 * shop" leg — real, not an error).
 */
export interface ParcelLeg {
  seq: number;
  place_type: ParcelLegPlaceType;
  place_id: number | null;
  place_name: string | null;
  source: ParcelLegSource;
  at: string | null;
}

export interface ParcelFeedRow {
  /** Stringified: an int for a PUDO parcel, a UUID for a warehouse one. */
  id: string;
  flow: ParcelFlow;
  route: ParcelRoute;
  route_source: ParcelRouteSource;
  /** The full journey, in order. `route` above is a label collapsed from this. */
  legs: ParcelLeg[];
  barcode: string | null;
  /**
   * Null for a bare warehouse parcel — that flow has no tracking number of
   * its own. Populated once a PUDO point has accepted the box: the row is
   * still anchored on the warehouse id (`flow` stays "warehouse"), but this
   * becomes the number the customer was actually texted.
   */
  tracking_number: string | null;
  /** Set only on a bridged PUDO-flow row: the warehouse parcel it came from. */
  wh_parcel_id: string | null;
  /** Set only on a bridged warehouse row: the PUDO-flow parcel it became. */
  pudo_parcel_id: number | null;
  /** Stored for a PUDO parcel; derived from the event log for a warehouse one. */
  status: string | null;
  recipient_name: string | null;
  pudo_name: string | null;
  warehouse_name: string | null;
  city_name: string | null;
  /** Null for warehouse rows: `wh_zones` is a different concept from `zones`. */
  zone_name: string | null;
  courier_id: string | null;
  created_at: string | null;
  received_at: string | null;
}

export type GetParcelFeedRes = {
  current_page: number;
  message: string;
  next_page: number | null;
  parcels: ParcelFeedRow[];
  prev_page: number | null;
  status: "success" | "error";
  total_pages: number;
  total_parcels: number;
};

export interface parcelFeedFilterOptions {
  page?: number;
  limit?: number;
  /** Substring match on barcode, across both flows. */
  barcode?: string;
  /** "all" merges both flows; "warehouse" is the warehouse module alone. */
  flow?: "all" | "warehouse";
  route?: ParcelRoute;
}

// Filter
export interface parcelFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
  /** Exact-match filter — the backend compares Parcel.barcode with `==`. */
  barcode?: string;
  /** Exact-match filter — the backend compares Parcel.tracking_number with `==`. */
  tracking_number?: string;
  date?: Date;
  status?: string;
  client?: string;
  city?: string;
  zone?: string;
}

export const parcelSchema = z.object({
  barcode: z.string().min(1, "Barcode is required"),
  tracking_number: z.string().min(1, "Tracking number is required"),
  pickup_period: z
    .number()
    .int()
    .positive("Pickup period must be a positive integer"),
  status: z
    .enum([
      "pending",
      "courier_received",
      "waiting_confirmation",
      "PUDO_received",
      "customer_received",
      "expired",
      "expired_received",
    ])
    .optional(),
  receiving_date: z
    .string()
    .datetime({ message: "Invalid receiving date format" })
    .optional(),
  delivering_date: z
    .string()
    .datetime({ message: "Invalid delivering date format" })
    .optional(),
  client_id: z.number().int().positive("Client ID must be a positive integer"),
  pudo_id: z
    .number()
    .int()
    .positive("PUDO ID must be a positive integer")
    .optional(),
  customer_id: z.string().uuid("Invalid customer ID format"),
});

// Sender/receiver party schemas (Bosta-style personal + location blocks)
export const partyPersonalSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone_number: saudiPhoneSchema,
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

// City and coordinates are required by the API. Zone is operational
// metadata that customers don't set, so it's optional; address and the
// National Address short code are optional too — the short code is just a
// convenience that auto-fills the other fields.
export const partyLocationSchema = z.object({
  address: z.string().max(255).optional(),
  city: z.string().min(1, "City is required"),
  zone: z.string().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  short_address: z
    .string()
    .optional()
    .refine((v) => !v || v.length === 8, {
      message: "National address code must be 8 characters",
    }),
  district: z.string().optional(),
  postal_code: z.string().optional(),
  building_number: z.string().optional(),
  additional_number: z.string().optional(),
});

export const parcelPartySchema = z.object({
  personal: partyPersonalSchema,
  location: partyLocationSchema,
});

// Parcel content schemas (what's inside the parcel)
// Sub-fields are individually optional (blank inputs come through as
// `undefined`), but if any one of length/width/height is filled in, all
// three are required together — mirrors the backend's DimensionsSchema.
export const dimensionsSchema = z
  .object({
    length: z.number().positive("Length must be greater than 0").optional(),
    width: z.number().positive("Width must be greater than 0").optional(),
    height: z.number().positive("Height must be greater than 0").optional(),
    unit: z.enum(["cm", "in"]).optional(),
  })
  .refine(
    (d) => {
      const provided = [d.length, d.width, d.height].filter(
        (v) => v !== undefined,
      );
      return provided.length === 0 || provided.length === 3;
    },
    {
      message: "Provide length, width and height together",
      path: ["length"],
    },
  );

export const parcelContentSchema = z.object({
  description: z.string().min(1, "Description is required"),
  size: z.enum(["small", "medium", "large", "extra_large"]).optional(),
  quantity: z
    .number()
    .int()
    .positive("Quantity must be a positive integer")
    .optional(),
  weight: z.number().positive("Weight must be greater than 0").optional(),
  dimensions: dimensionsSchema.optional(),
});

// Schema for creating parcels: Bosta-style sender + receiver sections.
// Tracking number and barcode are optional — they are no longer collected
// in the create form and are expected to be generated by the backend.
export const createParcelSchema = z.object({
  tracking_number: z.string().optional(),
  barcode: z.string().optional(),
  pickup_period: z
    .number()
    .int()
    .positive("Pickup period must be a positive integer"),
  client_id: z.number().int().positive().optional(),
  // Set when the receiver's location was picked as an existing PUDO
  // pickup point (via the map picker) rather than a plain address.
  pudo_id: z.number().int().positive().optional(),
  // Optional: customers creating their own parcel don't submit a sender —
  // the backend snapshots the personal info from their profile instead,
  // but still needs the sender's location from this form.
  sender: parcelPartySchema.optional(),
  receiver: parcelPartySchema,
  content: parcelContentSchema,
});

// Type inference
export type ParcelFormData = z.infer<typeof parcelSchema>;
export type CreateParcelFormData = z.infer<typeof createParcelSchema>;
export type ParcelPartyFormData = z.infer<typeof parcelPartySchema>;
export type DimensionsFormData = z.infer<typeof dimensionsSchema>;
export type ParcelContentFormData = z.infer<typeof parcelContentSchema>;
