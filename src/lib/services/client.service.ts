import {
  ClientFormData,
  ClientsResponse,
  ClientFilterOptions,
  ClientResponse,
} from "../schema/client.schema";
import { getParcelsRes } from "../schema/parcel.schema";
import { apiCall } from "./apiClient";

// Get all clients
export const getClients = async (
  filters?: ClientFilterOptions,
): Promise<ClientsResponse> => {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  return apiCall<ClientsResponse>({
    method: "GET",
    url: `/clients${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Client by ID
export const getClient = async (id: string): Promise<ClientResponse> => {
  const response = await apiCall<ClientResponse>({
    method: "GET",
    url: `/clients/${id}`,
  });

  return response;
};

// Get Client Parcels
export const getClientParcels = async (id: string): Promise<getParcelsRes> => {
  const response = await apiCall<getParcelsRes>({
    method: "GET",
    url: `/clients/${id}/parcels`,
  });
  return response;
};

// Create new client
export const createClient = async (data: Partial<ClientFormData>) => {
  return apiCall({
    method: "POST",
    url: "/clients",
    data,
  });
};

// Update client
export const updateClient = async (
  id: string,
  data: Partial<ClientFormData>,
) => {
  return apiCall({
    method: "PATCH",
    url: `/clients/${id}`,
    data,
  });
};

// Delete client
export const deleteClient = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/clients/${id}`,
  });
};
