import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  GetTicketRes,
  GetTicketsRes,
  TicketsQuery,
} from "@/lib/schema/tickets.schema";
import {
  createTicket,
  deleteTicket,
  getTicket,
  getTickets,
  updateTicket,
} from "../services/ticket.service";
import { UpdateTicketRequest } from "../schema/tickets.schema";

// Query keys factory for consistency
export const ticketKeys = {
  all: ["tickets"] as const,
  lists: () => [...ticketKeys.all, "list"] as const,
  list: (query: string) => [...ticketKeys.lists(), { query }] as const,
  details: () => [...ticketKeys.all, "detail"] as const,
  detail: (id: string) => [...ticketKeys.details(), id] as const,
};

// Create Ticket mutation
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      toast.success("Ticket created successfully");
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create ticket");
    },
  });
}

// Get Tickets (with pagination and filters)
export function useGetTickets(query?: Partial<TicketsQuery>) {
  return useQuery<GetTicketsRes>({
    queryKey: ticketKeys.list(JSON.stringify(query) || ""),
    queryFn: () => getTickets(query),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3, // Retry 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff
  });
}

// Get Ticket by ID hook
export function useGetTicket(id: string, enabled = true) {
  return useQuery<GetTicketRes>({
    queryKey: ticketKeys.detail(id),
    queryFn: () => getTicket(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Update ticket mutation
export function useUpdateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTicketRequest;
    }) => updateTicket(id, data),
    onSuccess: (_, variables) => {
      toast.success("Ticket updated successfully");
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: ticketKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update ticket");
    },
  });
}

// Delete ticket mutation
export function useDeleteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTicket,
    onSuccess: () => {
      toast.success("Ticket deleted successfully");
      queryClient.invalidateQueries({ queryKey: ticketKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete ticket");
    },
  });
}
