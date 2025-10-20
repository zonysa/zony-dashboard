import {
  partnerFilterOptions,
  PartnerFormData,
} from "../schema/partner.schema";
import { apiCall } from "./apiClient";

// Create Partner
export const createPartner = async (data: PartnerFormData) => {
  return apiCall({
    method: "POST",
    url: "/partners",
    data,
  });
};

// Get Partners
export const getPartners = async (filters: partnerFilterOptions) => {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);

  return apiCall({
    method: "GET",
    url: `/partners${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Partner by ID
export const getPartner = async (id: string) => {
  return apiCall({
    method: "GET",
    url: `/partners/${id}`,
  });
};

// Get Partner Branches
export const getPartnerBranches = async (id: string) => {
  return apiCall({
    method: "GET",
    url: `/partners/${id}/pudos`,
  });
};

// Update Partner by ID
export const updatetPartner = async (
  id: string,
  data: Partial<PartnerFormData>
) => {
  return apiCall({
    method: "PATCH",
    url: `/partners/${id}`,
    data,
  });
};

// Delete Partner by ID
export const deletePartner = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/partners/${id}`,
  });
};
