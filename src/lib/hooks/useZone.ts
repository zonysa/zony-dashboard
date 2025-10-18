import {
  CreateZoneRes,
  GetZonesFilter,
  GetZonesRes,
  ZoneRes,
} from "@/lib/schema/zones.schema";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createZone, getZones } from "../services/location/zone.service";

// Query keys for consistency
export const zoneKeys = {
  all: ["zones"] as const,
  lists: () => [...zoneKeys.all, "list"] as const,
  list: (filters: string) => [...zoneKeys.lists(), { filters }] as const,
  details: () => [...zoneKeys.all, "detail"] as const,
  detail: (id: string) => [...zoneKeys.details(), id] as const,
};

// Create Zone
export function useCreateZone() {
  return useMutation<CreateZoneRes, Error, ZoneRes>({
    mutationFn: createZone,
  });
}

// Get Zones Hook
export function useGetZones(filters?: GetZonesFilter) {
  return useQuery<GetZonesRes, Error>({
    queryKey: zoneKeys.list(filters),
    queryFn: () => getZones(filters),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
    retry: 3, // Retry failed requests 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
