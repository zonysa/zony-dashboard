import {
  BusinessTypeDetails,
  CreateBusinessTypeRes,
  GetBusinessTypesRes,
  GetBusinessTypeRes,
} from "@/lib/schema/businessType.schema";
import { apiCall } from "./apiClient";

// Create Business Type
export const createBusinessType = async (
  data: BusinessTypeDetails
): Promise<CreateBusinessTypeRes> => {
  return apiCall({
    method: "POST",
    url: "/business-types",
    data,
  });
};

// Get Business Types
export const getBusinessTypes = async (): Promise<GetBusinessTypesRes> => {
  return apiCall({
    method: "GET",
    url: "/business-types",
  });
};

// Get Business Type by ID
export const getBusinessType = async (
  id: number
): Promise<GetBusinessTypeRes> => {
  return apiCall({
    method: "GET",
    url: `/business-types/${id}`,
  });
};

// Update Business Type by ID
export const updateBusinessType = async (
  id: number,
  data: Partial<BusinessTypeDetails>
) => {
  return apiCall({
    method: "PATCH",
    url: `/business-types/${id}`,
    data,
  });
};

// Delete Business Type by ID
export const deleteBusinessType = async (id: number) => {
  return apiCall({
    method: "DELETE",
    url: `/business-types/${id}`,
  });
};
