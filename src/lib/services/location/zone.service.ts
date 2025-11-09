import {
  GetZonesRes,
  ZoneFormData,
  GetZonesFilter,
  GetZoneRes,
  CreateZoneRes,
} from "@/lib/schema/zones.schema";
import { apiCall } from "../apiClient";
import {
  GetCouriersRes,
  GetCustomerServicesRes,
  GetSupervisorsRes,
} from "@/lib/schema/user.schema";
import { GetDistrictsRes } from "@/lib/schema/district.schema";

// Create Zone
export const createZone = async (
  data: ZoneFormData
): Promise<CreateZoneRes> => {
  return apiCall({
    method: "POST",
    url: "/zones",
    data,
  });
};

// Get Zones
export const getZones = async (
  filters?: GetZonesFilter
): Promise<GetZonesRes> => {
  const params = new URLSearchParams();

  if (filters?.cityId) params.append("city_id", filters.cityId.toString());
  if (filters?.districtId)
    params.append("district_id", filters.districtId.toString());
  if (filters?.zoneId) params.append("zone_id", filters.zoneId.toString());

  return apiCall({
    method: "GET",
    url: `/zones${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get Zone by ID
export const getZone = async (id: string): Promise<GetZoneRes> => {
  return apiCall({
    method: "GET",
    url: `/zones/${id}`,
  });
};

// Get Zone by ID
export const getZoneCustomerServices = async (
  id: string
): Promise<GetCustomerServicesRes> => {
  return apiCall({
    method: "GET",
    url: `/zones/${id}/customer-service`,
  });
};

// Get Zone by ID
export const getZoneCouriers = async (id: string): Promise<GetCouriersRes> => {
  return apiCall({
    method: "GET",
    url: `/zones/${id}/couriers`,
  });
};

// Get Zone by ID
export const getZoneSupervisors = async (
  id: string
): Promise<GetSupervisorsRes> => {
  return apiCall({
    method: "GET",
    url: `/zones/${id}/supervisors`,
  });
};

// Get Zone by ID
export const getZoneDistricts = async (
  id: string
): Promise<GetDistrictsRes> => {
  return apiCall({
    method: "GET",
    url: `/zones/${id}/districts`,
  });
};

// Update Zone by ID
export const updateZone = async (id: string, data: Partial<ZoneFormData>) => {
  return apiCall({
    method: "PATCH",
    url: `/zones/${id}`,
    data,
  });
};

// Delete Zone by ID
export const deleteZone = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/zones/${id}`,
  });
};

// Assign Districts to Zone
export const assignDistrictsToZone = async (
  zoneId: string,
  districtIds: number[]
) => {
  return apiCall({
    method: "POST",
    url: `/zones/${zoneId}/districts`,
    data: { district_ids: districtIds },
  });
};

// Assign Supervisors to Zone
export const assignSupervisorsToZone = async (
  zoneId: string,
  supervisorIds: string[]
) => {
  return apiCall({
    method: "POST",
    url: `/zones/${zoneId}/supervisors`,
    data: { supervisor_ids: supervisorIds },
  });
};

// Assign Couriers to Zone
export const assignCouriersToZone = async (
  zoneId: string,
  courierIds: string[]
) => {
  return apiCall({
    method: "POST",
    url: `/zones/${zoneId}/couriers`,
    data: { couriers_ids: courierIds },
  });
};

// Assign Customer Services to Zone
export const assignCustomerServicesToZone = async (
  zoneId: string,
  customerServiceIds: string[]
) => {
  return apiCall({
    method: "POST",
    url: `/zones/${zoneId}/customer-service`,
    data: { customer_service_ids: customerServiceIds },
  });
};

// Unassign District from Zone
export const unassignDistrictFromZone = async (
  zoneId: string,
  districtId: string
) => {
  return apiCall({
    method: "DELETE",
    url: `/zones/${zoneId}/districts`,
    data: { district_ids: [districtId] },
  });
};

// Unassign Supervisor from Zone
export const unassignSupervisorFromZone = async (
  zoneId: string,
  supervisorId: string
) => {
  return apiCall({
    method: "DELETE",
    url: `/zones/${zoneId}/supervisors`,
    data: { supervisor_ids: [supervisorId] },
  });
};

// Unassign Courier from Zone
export const unassignCourierFromZone = async (
  zoneId: string,
  courierId: string
) => {
  return apiCall({
    method: "DELETE",
    url: `/zones/${zoneId}/couriers`,
    data: { couriers_ids: [courierId] },
  });
};

// Unassign Customer Service from Zone
export const unassignCustomerServiceFromZone = async (
  zoneId: string,
  customerServiceId: string
) => {
  return apiCall({
    method: "DELETE",
    url: `/zones/${zoneId}/customer-service`,
    data: { customer_service_ids: [customerServiceId] },
  });
};
