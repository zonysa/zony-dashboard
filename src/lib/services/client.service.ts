import { ClientFormData, ClientsResponse } from "../schema/client.schema";
import { getParcelsRes } from "../schema/parcel.schema";
import { apiCall } from "./apiClient";

// Get all clients
export const getClients = async (
  filters?: Record<string, unknown>
): Promise<ClientsResponse> => {
  return apiCall<ClientsResponse>({
    method: "GET",
    url: "/clients",
    params: filters,
  });
};

// Get Client by ID
export const getClient = async (id: string) => {
  return apiCall({
    method: "GET",
    url: `/clients/${id}`,
  });
};

// Get Client Parcels
export const getClientParcels = async (id: string): Promise<getParcelsRes> => {
  return apiCall({
    method: "GET",
    url: `/clients/${id}/parcels`,
  });
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
  data: Partial<ClientFormData>
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
