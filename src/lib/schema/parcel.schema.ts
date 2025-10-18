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

// Type for individual parcel item
export type ParcelItem = {
  city_name: string;
  client_name: string;
  courier_id: string;
  id: number;
  pudo_id: number;
  receiving_date: string;
  status:
    | "waiting_confirmation"
    | "pending"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "failed";
  tracking_number: string;
  zone_name: string;
};

// Type for parcel details
export type ParcelDetails = {
  barcode: string;
  city_name: string;
  client_name: string;
  courier_id: string;
  created_at: string;
  customer_phone_number: string;
  delivering_date: string;
  id: number;
  images: string | null;
  pickup_period: number;
  pudo_id: number;
  receiving_code: string | null;
  receiving_date: string;
  status:
    | "waiting_confirmation"
    | "pending"
    | "in_transit"
    | "delivered"
    | "cancelled"
    | "failed";
  tracking_number: string;
  updated_at: string;
  zone_name: string;
};

// Type for the getParcel API response
export type GetParcelResponse = {
  message: string;
  parcel: ParcelDetails;
  status: "success" | "error";
};

// Type for the complete API response
export type getParcelsRes = {
  current_page: number;
  message: string;
  next_page: number | null;
  parcels: ParcelItem[];
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
  tracking_number: z.string().min(1, "Tracking number is required"),
  barcode: z.string().min(1, "Barcode is required"),
  pickup_period: z
    .number()
    .int()
    .positive("Pickup period must be a positive integer"),
  status: z.enum(["pending", "in_transit", "delivered", "cancelled", "failed"]),
  receiving_date: z
    .string()
    .datetime({ message: "Invalid receiving date format" }),
  delivering_date: z
    .string()
    .datetime({ message: "Invalid delivering date format" }),
  client_id: z.number().int().positive("Client ID must be a positive integer"),
  pudo_id: z.number().int().positive("PUDO ID must be a positive integer"),
  customer_id: z.string().uuid("Invalid customer ID format"),
});

// Type inference
export type ParcelFormData = z.infer<typeof parcelSchema>;
