import z from "zod";

export interface ParcelTable {
  tn: number;
  pudo: string;
  delivery: string;
  city: string;
  zone: string;
  receivingDate: Date;
  status: "Delivered" | "In Transit" | "Pending" | "Failed" | "Returned";
  client: string;
}

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
  address: string;
  city?: string | null;
  zone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ParcelParty {
  personal: PartyPersonal;
  location?: PartyLocation | null;
}

// Type for parcel details
export type ParcelDetails = {
  barcode: string;
  city_name: string | null;
  client_name: string | null;
  courier_id: string | null;
  courier_name: string | null;
  courier_phone_number: string | null;
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
  status:
    | "waiting_confirmation"
    | "pending"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "failed";
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

// Filter
export interface parcelFilterOptions {
  page?: number;
  limit?: number;
  search?: string;
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
    .enum(["pending", "in_transit", "delivered", "cancelled", "failed"])
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
  phone_number: z.string().min(7, "Phone number is required"),
  email: z
    .string()
    .email("Invalid email address")
    .optional()
    .or(z.literal("")),
});

export const partyLocationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().optional(),
  zone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

export const parcelPartySchema = z.object({
  personal: partyPersonalSchema,
  location: partyLocationSchema,
});

// Schema for creating parcels: Bosta-style sender + receiver sections
export const createParcelSchema = z.object({
  tracking_number: z.string().min(1, "Tracking number is required"),
  barcode: z.string().min(1, "Barcode is required"),
  pickup_period: z
    .number()
    .int()
    .positive("Pickup period must be a positive integer"),
  client_id: z.number().int().positive().optional(),
  sender: parcelPartySchema,
  receiver: parcelPartySchema,
});

// Type inference
export type ParcelFormData = z.infer<typeof parcelSchema>;
export type CreateParcelFormData = z.infer<typeof createParcelSchema>;
export type ParcelPartyFormData = z.infer<typeof parcelPartySchema>;
