import { customerServiceFilterOptions } from "../schema/customer-service.schema";
import { apiCall } from "./apiClient";

// Get CustomerServices
export const getCustomerServices = async (
  filters: customerServiceFilterOptions
) => {
  const params = new URLSearchParams();

  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);

  return apiCall({
    method: "GET",
    url: `/${params.toString() ? `?${params.toString()}` : ""}`,
  });
};
