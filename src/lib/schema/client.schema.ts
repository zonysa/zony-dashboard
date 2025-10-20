import { z } from "zod";

// Client status enum
export const ClientStatus = z.enum(["active", "inactive", "suspended"]);

export const ClientType = z.enum([
  "E-Commerce",
  "Retail",
  "Logistics",
  "Other",
]);

export const Currency = z.enum(["USD", "EUR", "EGP", "GBP"]);

// Add these fields to your clientSchema in clientSchema.ts
export const clientSchema = z.object({
  id: z.number(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  contact_person: z.string().min(2, "Contact person name is required"),
  type: ClientType,
  status: ClientStatus,
  currency: Currency,
  payout_per_parcel: z.number().positive("Payout must be positive"),
  // Add these optional fields for table display
  total_parcels: z.number().optional(),
  delivery_rate: z.number().optional(),
  pudo_points_used: z.number().optional(),
});

// Client form schema (for create/update - without id and timestamps)
export const clientFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 digits"),
  contact_person: z.string().min(2, "Contact person name is required"),
  type: ClientType,
  status: ClientStatus.default("active"),
  currency: Currency.default("USD"),
  payout_per_parcel: z.number().positive("Payout must be positive"),
});

// Clients list response schema
export const clientsResponseSchema = z.object({
  clients: z.array(clientSchema),
  current_page: z.number(),
  total_pages: z.number(),
  total_clients: z.number(),
  next_page: z.number().nullable(),
  prev_page: z.number().nullable(),
  status: z.string(),
  message: z.string(),
});

// Types
export type Client = z.infer<typeof clientSchema>;
export type ClientFormData = z.infer<typeof clientFormSchema>;
export type ClientsResponse = z.infer<typeof clientsResponseSchema>;
export type ClientStatusType = z.infer<typeof ClientStatus>;
export type ClientTypeEnum = z.infer<typeof ClientType>;
export type CurrencyType = z.infer<typeof Currency>;
