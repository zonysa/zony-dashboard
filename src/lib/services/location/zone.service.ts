import { GetZonesFilter } from "@/lib/schema/zones.schema";
import { apiCall } from "../apiClient";

export const createZone = async (data: string) => {
  return apiCall({
    method: "POST",
    url: "/zones",
    data,
  });
};

export const getZones = async (filters?: GetZonesFilter) => {
  const params = new URLSearchParams();

  if (filters?.cityId) params.append("city", filters.cityId.toString());
  if (filters?.districtId)
    params.append("district", filters.districtId.toString());
  if (filters?.zoneId) params.append("zone", filters.zoneId.toString());

  return apiCall({
    method: "GET",
    url: `/zones${params.toString() ? `?${params.toString()}` : ""}`,
  });
};
