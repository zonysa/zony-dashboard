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

// Type for parcel details
export type ParcelDetails = {
  barcode: string;
  city_name: string | null;
  client_name: string;
  courier_id: string | null;
  courier_name: string | null;
  courier_phone_number: string | null;
  created_at: string;
  customer_id: string;
  customer_name: string;
  customer_phone_number: string;
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

// Schema for creating parcels (minimal required fields)
export const createParcelSchema = z.object({
  tracking_number: z.string().min(1, "Tracking number is required"),
  barcode: z.string().min(1, "Barcode is required"),
  pickup_period: z.coerce
    .number()
    .int()
    .positive("Pickup period must be a positive integer"),
  client_id: z.coerce.number().int().positive("Client is required"),
  customer_id: z.string().uuid("Invalid customer ID format"),
});

// Type inference
export type ParcelFormData = z.infer<typeof parcelSchema>;
export type CreateParcelFormData = z.infer<typeof createParcelSchema>;
