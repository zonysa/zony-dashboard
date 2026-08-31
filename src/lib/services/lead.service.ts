import {
  GetLeadRes,
  GetLeadsRes,
  LeadFilterOptions,
  UpdateLeadRequest,
} from "../schema/lead.schema";
import { apiCall } from "./apiClient";

// Get Leads
export const getLeads = async (
  filters: LeadFilterOptions
): Promise<GetLeadsRes> => {
  const params = new URLSearchParams();

  if (filters?.status) params.append("status", filters.status);
  if (filters?.source_tab) params.append("source_tab", filters.source_tab);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  // Backend reads `per_page`, not `limit` — keep the option named `limit`
  // for consistency with the other services and translate it here.
  if (filters?.limit) params.append("per_page", filters.limit.toString());

  return apiCall({
    method: "GET",
    url: `/leads${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Lead by ID
export const getLead = async (id: string): Promise<GetLeadRes> => {
  return apiCall({
    method: "GET",
    url: `/leads/${id}`,
  });
};

// Update Lead by ID
export const updateLead = async (id: string, data: UpdateLeadRequest) => {
  return apiCall({
    method: "PATCH",
    url: `/leads/${id}`,
    data,
  });
};
