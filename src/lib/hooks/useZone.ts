import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createZone,
  deleteZone,
  getZone,
  getZoneCouriers,
  getZoneCustomerServices,
  getZoneDistricts,
  getZones,
  getZoneSupervisors,
  updateZone,
  assignDistrictsToZone,
  assignSupervisorsToZone,
  assignCouriersToZone,
  assignCustomerServicesToZone,
  unassignDistrictFromZone,
  unassignSupervisorFromZone,
  unassignCourierFromZone,
  unassignCustomerServiceFromZone,
} from "@/lib/services/location/zone.service";
import {
  ZoneFormData,
  GetZonesFilter,
  GetZonesRes,
  GetZoneRes,
  CreateZoneRes,
} from "@/lib/schema/zones.schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GetDistrictsRes } from "../schema/district.schema";
import {
  GetCouriersRes,
  GetCustomerServicesRes,
  GetSupervisorsRes,
} from "../schema/user.schema";

// Query keys factory
export const zoneKeys = {
  all: ["zones"] as const,
  lists: () => [...zoneKeys.all, "list"] as const,
  list: (filters: string) => [...zoneKeys.lists(), filters] as const,
  details: () => [...zoneKeys.all, "detail"] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,

  // Zone-specific sub-resources
  // For endpoint: /zones/{id}/supervisors
  zoneSupervisors: (zoneId: string) =>
    [...zoneKeys.detail(zoneId), "supervisors"] as const,
  zoneSupervisorsWithFilters: (zoneId: string, filters: string) =>
    [...zoneKeys.zoneSupervisors(zoneId), filters] as const,

  // For endpoint: /zones/{id}/couriers
  zoneCouriers: (zoneId: string) =>
    [...zoneKeys.detail(zoneId), "couriers"] as const,
  zoneCouriersWithFilters: (zoneId: string, filters: string) =>
    [...zoneKeys.zoneCouriers(zoneId), filters] as const,

  // For endpoint: /zones/{id}/customer-service
  zoneCustomerServices: (zoneId: string) =>
    [...zoneKeys.detail(zoneId), "customer-service"] as const,
  zoneCustomerServicesWithFilters: (zoneId: string, filters: string) =>
    [...zoneKeys.zoneCustomerServices(zoneId), filters] as const,

  // For endpoint: /zones/{id}/districts
  zoneDistricts: (zoneId: string) =>
    [...zoneKeys.detail(zoneId), "districts"] as const,
  zoneDistrictsWithFilters: (zoneId: string, filters: string) =>
    [...zoneKeys.zoneDistricts(zoneId), filters] as const,
};

// Get all zones
export function useGetZones(filters?: GetZonesFilter) {
  return useQuery<GetZonesRes, Error>({
    queryKey: zoneKeys.list(JSON.stringify(filters) || ""),
    queryFn: () => getZones(filters),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Get single zone by ID
export function useGetZone(id: string) {
  return useQuery<GetZoneRes, Error>({
    queryKey: zoneKeys.detail(id),
    queryFn: () => getZone(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Get Zone Districts
export function useGetZoneDistricts(id: string) {
  return useQuery<GetDistrictsRes, Error>({
    queryKey: zoneKeys.zoneDistricts(id),
    queryFn: () => getZoneDistricts(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Get Zone Supervisors
export function useGetZoneSupervisors(id: string) {
  return useQuery<GetSupervisorsRes, Error>({
    queryKey: zoneKeys.zoneSupervisors(id),
    queryFn: () => getZoneSupervisors(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Get Zone Couriers
export function useGetZoneCouriers(id: string) {
  return useQuery<GetCouriersRes, Error>({
    queryKey: zoneKeys.zoneCouriers(id),
    queryFn: () => getZoneCouriers(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Get Zone Customer Services
export function useGetZoneCustomerServices(id: string) {
  return useQuery<GetCustomerServicesRes, Error>({
    queryKey: zoneKeys.zoneCustomerServices(id),
    queryFn: () => getZoneCustomerServices(id),
    enabled: !!id, // Only run query if id exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}

// Create zone
export function useCreateZone() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<CreateZoneRes, Error, ZoneFormData>({
    mutationFn: createZone,
    onSuccess: () => {
      // Invalidate and refetch zones list
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });

      // Redirect to zones list
      router.push("/zones");
    },
    onError: (error) => {
      console.error("Create zone error:", error);
      toast.error(error.message || "Failed to create zone");
    },
  });
}

// Update zone
export function useUpdateZone(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<unknown, Error, Partial<ZoneFormData>>({
    mutationFn: (data) => updateZone(id, data),
    onSuccess: () => {
      // Show success message
      toast.success("Zone updated successfully");

      // Invalidate the specific zone and the list
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });

      // Redirect to zones list or detail page
      router.push("/zones");
    },
    onError: (error) => {
      console.error("Update zone error:", error);
      toast.error(error.message || "Failed to update zone");
    },
  });
}

// Delete zone
export function useDeleteZone() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<unknown, Error, string>({
    mutationFn: deleteZone,
    onSuccess: () => {
      // Show success message
      toast.success("Zone deleted successfully");

      // Invalidate zones list
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });

      // Redirect to zones list
      router.push("/zones");
    },
    onError: (error) => {
      console.error("Delete zone error:", error);
      toast.error(error.message || "Failed to delete zone");
    },
  });
}

// Toggle zone active status
// export function useToggleZoneStatus(id: string) {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: (isActive) => updateZone(id, { inactive }),
//     onSuccess: () => {
//       // Show success message
//       toast.success("Zone status updated");

//       // Invalidate the specific zone and the list
//       queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) });
//       queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
//     },
//     onError: (error) => {
//       console.error("Toggle zone status error:", error);
//       toast.error(error.message || "Failed to update zone status");
//     },
//   });
// }

// Bulk delete zones
export function useBulkDeleteZones() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string[]>({
    mutationFn: async (zoneIds) => {
      // Execute deletions in parallel
      await Promise.all(zoneIds.map((id) => deleteZone(id)));
    },
    onSuccess: () => {
      // Show success message
      toast.success("Zones deleted successfully");

      // Invalidate zones list
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() });
    },
    onError: (error) => {
      console.error("Bulk delete zones error:", error);
      toast.error(error.message || "Failed to delete zones");
    },
  });
}

// Prefetch zone data (useful for hover preview)
export function usePrefetchZone() {
  const queryClient = useQueryClient();

  return (id: string) => {
    return queryClient.prefetchQuery({
      queryKey: zoneKeys.detail(id),
      queryFn: () => getZone(id),
      staleTime: 5 * 60 * 1000,
    });
  };
}

// Get zone from cache (without refetching)
export function useZoneFromCache(id: string) {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<GetZoneRes>(zoneKeys.detail(id));
}

// Invalidate zone queries manually
export function useInvalidateZones() {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: zoneKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: zoneKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(id) }),
  };
}

// Assign Districts to Zone
export function useAssignDistrictsToZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, number[]>({
    mutationFn: (districtIds) => assignDistrictsToZone(zoneId, districtIds),
    onSuccess: () => {
      toast.success("Districts assigned successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneDistricts(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Assign districts error:", error);
      toast.error(error.message || "Failed to assign districts");
    },
  });
}

// Assign Supervisors to Zone
export function useAssignSupervisorsToZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string[]>({
    mutationFn: (supervisorIds) =>
      assignSupervisorsToZone(zoneId, supervisorIds),
    onSuccess: () => {
      toast.success("Supervisors assigned successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneSupervisors(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Assign supervisors error:", error);
      toast.error(error.message || "Failed to assign supervisors");
    },
  });
}

// Assign Couriers to Zone
export function useAssignCouriersToZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string[]>({
    mutationFn: (courierIds) => assignCouriersToZone(zoneId, courierIds),
    onSuccess: () => {
      toast.success("Couriers assigned successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneCouriers(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Assign couriers error:", error);
      toast.error(error.message || "Failed to assign couriers");
    },
  });
}

// Assign Customer Services to Zone
export function useAssignCustomerServicesToZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string[]>({
    mutationFn: (customerServiceIds) =>
      assignCustomerServicesToZone(zoneId, customerServiceIds),
    onSuccess: () => {
      toast.success("Customer services assigned successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneCustomerServices(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Assign customer services error:", error);
      toast.error(error.message || "Failed to assign customer services");
    },
  });
}

// Unassign District from Zone
export function useUnassignDistrictFromZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (districtId) => unassignDistrictFromZone(zoneId, districtId),
    onSuccess: () => {
      toast.success("District removed successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneDistricts(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Unassign district error:", error);
      toast.error(error.message || "Failed to remove district");
    },
  });
}

// Unassign Supervisor from Zone
export function useUnassignSupervisorFromZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (supervisorId) =>
      unassignSupervisorFromZone(zoneId, supervisorId),
    onSuccess: () => {
      toast.success("Supervisor removed successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneSupervisors(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Unassign supervisor error:", error);
      toast.error(error.message || "Failed to remove supervisor");
    },
  });
}

// Unassign Courier from Zone
export function useUnassignCourierFromZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (courierId) => unassignCourierFromZone(zoneId, courierId),
    onSuccess: () => {
      toast.success("Courier removed successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneCouriers(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Unassign courier error:", error);
      toast.error(error.message || "Failed to remove courier");
    },
  });
}

// Unassign Customer Service from Zone
export function useUnassignCustomerServiceFromZone(zoneId: string) {
  const queryClient = useQueryClient();

  return useMutation<unknown, Error, string>({
    mutationFn: (customerServiceId) =>
      unassignCustomerServiceFromZone(zoneId, customerServiceId),
    onSuccess: () => {
      toast.success("Customer service removed successfully");
      queryClient.invalidateQueries({
        queryKey: zoneKeys.zoneCustomerServices(zoneId),
      });
      queryClient.invalidateQueries({ queryKey: zoneKeys.detail(zoneId) });
    },
    onError: (error) => {
      console.error("Unassign customer service error:", error);
      toast.error(error.message || "Failed to remove customer service");
    },
  });
}
