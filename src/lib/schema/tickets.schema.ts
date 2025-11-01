import { z } from "zod";

// Customer data in ticket
export interface CustomerData {
  phone_number: string;
  first_name: string;
}

// Ticket Details (API Response)
export interface TicketDetails {
  id: number;
  tracking_number: string;
  pudo_name: string;
  zone_name: string;
  status: string;
  action_taken: string;
  comment: string;
  rating: string;
  customer_data: CustomerData;
  created_at: string;
  updated_at: string;
}

// Get Tickets Response (List)
export interface GetTicketsRes {
  tickets: TicketDetails[];
  total_tickets: number;
  current_page: number;
  total_pages: number;
  next_page: number | null;
  prev_page: number | null;
  message: string;
  status: "success" | "error";
}

// Get Ticket Response (Single)
export interface GetTicketRes {
  ticket: TicketDetails;
  message: string;
  status: "success" | "error";
}

// Zod Schemas
export const ticketStatusSchema = z.enum([
  "open",
  "closed",
  "in_progress",
  "resolved",
]);

export const actionTakenSchema = z.enum([
  "pending",
  "in_progress",
  "resolved",
  "escalated",
  "cancelled",
]);

export const customerDataSchema = z.object({
  first_name: z.string().min(1, "first_name is required"),
  // allow common phone formats, 7–20 chars (numbers, spaces, +, -, parentheses)
  phone_number: z
    .string()
    .min(7, "phone_number is too short")
    .max(20, "phone_number is too long")
    .regex(
      /^[+\d][\d\s\-()]+$/,
      "phone_number must contain only digits and formatting characters"
    ),
});

// Ticket Form Schema (for creating/editing tickets)
export const ticketFormSchema = z.object({
  status: ticketStatusSchema,
  actionTaken: actionTakenSchema,
  comment: z.string().min(1, "Comment is required"),
  rating: z.coerce
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5"),
  customerId: customerDataSchema,
  zoneId: z.coerce.number().min(1, "Zone ID is required"),
  parcelId: z.coerce.number().min(1, "Parcel ID is required"),
});

// Tickets Query Schema (for list/pagination)
export const ticketsQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50),
  search: z.string().optional(),
  filters: z.record(z.string(), z.string()).default({}),
});

// Types
export type TicketFormData = z.infer<typeof ticketFormSchema>;
export type TicketsQuery = z.infer<typeof ticketsQuerySchema>;

// API Request Type (snake_case for backend)
export type CreateTicketRequest = {
  status: z.infer<typeof ticketStatusSchema>;
  action_taken: z.infer<typeof actionTakenSchema>;
  comment: string;
  rating: number;
  customer_id: string;
  zone_id: number;
  parcel_id: number;
};

// Update Ticket Request (all fields optional)
export type UpdateTicketRequest = Partial<CreateTicketRequest>;
