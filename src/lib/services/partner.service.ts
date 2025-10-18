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
