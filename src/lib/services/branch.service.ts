import {
  BranchFilterOptions,
  BranchFormData,
  GetBranchesRes,
  GetBranchRes,
} from "../schema/branch.schema";
import { getParcelsRes } from "../schema/parcel.schema";
import { apiCall } from "./apiClient";

// Create Partner
export const createBranch = async (data: BranchFormData) => {
  return apiCall({
    method: "POST",
    url: "/pudos",
    data,
  });
};

// Get Partners
export const getBranches = async (
  filters: BranchFilterOptions
): Promise<GetBranchesRes> => {
  const params = new URLSearchParams();

  if (filters?.city) params.append("city", filters.city);
  if (filters?.zone) params.append("zone", filters.zone);
  if (filters?.district) params.append("district", filters.district);
  if (filters?.status) params.append("status", filters.status);

  return apiCall({
    method: "GET",
    url: `/pudos${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Partner By Id
export const getBranchById = async (id: string): Promise<GetBranchRes> => {
  return apiCall({
    method: "GET",
    url: `/pudos/${id}`,
  });
};

// Get Branch Parcels
export const getBranchParcels = async (id: string): Promise<getParcelsRes> => {
  return apiCall({
    method: "GET",
    url: `/pudos/${id}/parcels`,
  });
};

// Update Parcel by ID
export const updaetBranch = async (
  id: string,
  data: Partial<BranchFormData>
) => {
  return apiCall({
    method: "PATCH",
    url: `/branch/${id}`,
    data,
  });
};

// Delete Branch by ID
export const deleteBranch = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/branch/${id}`,
  });
};
