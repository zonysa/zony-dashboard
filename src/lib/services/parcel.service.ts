import {
  CreateParcelRes,
  GetParcelRes,
  getParcelsRes,
  parcelFilterOptions,
  ParcelFormData,
  CreateParcelFormData,
} from "../schema/parcel.schema";
import { apiCall } from "./apiClient";

// Create Parcel
export const createParcel = async (
  data: CreateParcelFormData | ParcelFormData
): Promise<CreateParcelRes> => {
  return apiCall({
    method: "POST",
    url: "/parcels",
    data,
  });
};

// Get Partners
export const getParcels = async (
  filters: parcelFilterOptions
): Promise<getParcelsRes> => {
  const params = new URLSearchParams();

  // Pagination
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  // Search
  if (filters?.search) params.append("search", filters.search);

  // Existing filters
  if (filters?.date) params.append("date", filters.date.toISOString());
  if (filters?.client) params.append("client", filters.client);
  if (filters?.city) params.append("city", filters.city);
  if (filters?.zone) params.append("zone", filters.zone);
  if (filters?.status) params.append("status", filters.status);

  return apiCall({
    method: "GET",
    url: `/parcels${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Single Parcel by ID
export const getParcelById = async (id: string): Promise<GetParcelRes> => {
  return apiCall({
    method: "GET",
    url: `/parcels/${id}`,
  });
};

// Update Parcel by ID
export const updateParcel = async (
  id: string,
  data: Partial<ParcelFormData>
) => {
  return apiCall({
    method: "PATCH",
    url: `/parcels/${id}`,
    data,
  });
};

// Delete Parcel by ID
export const deleteParcel = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/parcels/${id}`,
  });
};
