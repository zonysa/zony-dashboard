import { z } from "zod";

// Customer data in ticket
export interface CustomerData {
  phone_number: string;
  username: string;
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

// Ticket Form Schema (for creating/editing tickets)
export const ticketFormSchema = z.object({
  status: ticketStatusSchema,
  actionTaken: actionTakenSchema,
  comment: z.string().min(1, "Comment is required"),
  rating: z.coerce
    .number()
    .min(0, "Rating must be at least 0")
    .max(5, "Rating must be at most 5"),
  customerId: z.string().refine((val) => {
    // UUID v4 validation regex
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(val);
  }, "Invalid customer ID"),
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
