import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getClients,
  getClient,
  getClientParcels,
  createClient,
  updateClient,
  deleteClient,
} from "@/lib/services/client.service";
import { ClientFormData } from "../schema/client.schema";

// Query keys
export const clientKeys = {
  all: ["clients"] as const,
  lists: () => [...clientKeys.all, "list"] as const,
  list: (filters: string) => [...clientKeys.lists(), { filters }] as const,
  details: () => [...clientKeys.all, "detail"] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  parcels: (id: string) => [...clientKeys.all, "parcels", id] as const,
};

// Get all clients
export function useGetClients(filters?: Record<string, any>) {
  return useQuery({
    queryKey: clientKeys.list(JSON.stringify(filters)),
    queryFn: () => getClients(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get Client by ID
export function useGetClient(id: string, enabled = true) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get Client Parcels
export function useGetClientParcels(id: string, enabled = true) {
  return useQuery({
    queryKey: clientKeys.parcels(id),
    queryFn: () => getClientParcels(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Create client mutation
export function useCreateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to create client");
    },
  });
}

// Update client mutation
export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ClientFormData> }) =>
      updateClient(id, data),
    onSuccess: (_, variables) => {
      toast.success("Client updated successfully");
      // Invalidate both the list and the specific detail
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to update client");
    },
  });
}

// Delete client mutation
export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      toast.success("Client deleted successfully");
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to delete client");
    },
  });
}
