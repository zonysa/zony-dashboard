import { BranchFilterOptions, BranchFormData } from "../schema/branch.schema";
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
export const getBranches = async (filters: BranchFilterOptions) => {
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
