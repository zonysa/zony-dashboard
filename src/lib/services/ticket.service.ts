import {
  CreateTicketRequest,
  GetTicketRes,
  GetTicketsRes,
  TicketsQuery,
  UpdateTicketRequest,
} from "../schema/tickets.schema";
import { apiCall } from "./apiClient";

// Create Ticket
export const createTicket = async (data: CreateTicketRequest) => {
  return apiCall({
    method: "POST",
    url: "/tickets",
    data,
  });
};

// Get Tickets (with pagination and filters)
export const getTickets = async (
  query?: Partial<TicketsQuery>
): Promise<GetTicketsRes> => {
  const params = new URLSearchParams();

  if (query?.page) params.append("page", query.page.toString());
  if (query?.limit) params.append("limit", query.limit.toString());
  if (query?.search) params.append("search", query.search);

  // Add any additional filters
  if (query?.filters) {
    Object.entries(query.filters).forEach(([key, value]) => {
      params.append(key, value);
    });
  }

  return apiCall({
    method: "GET",
    url: `/tickets${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Ticket by ID
export const getTicket = async (id: string): Promise<GetTicketRes> => {
  return apiCall({
    method: "GET",
    url: `/tickets/${id}`,
  });
};

// Update Ticket by ID
export const updateTicket = async (
  id: string,
  data: UpdateTicketRequest
) => {
  return apiCall({
    method: "PATCH",
    url: `/tickets/${id}`,
    data,
  });
};

// Delete Ticket by ID
export const deleteTicket = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/tickets/${id}`,
  });
};