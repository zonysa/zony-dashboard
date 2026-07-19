import { useMutation } from "@tanstack/react-query";

import { ResolveAddressRes } from "@/lib/schema/nationalAddress.schema";
import {
  geocodeCoordinates,
  resolveShortAddress,
} from "@/lib/services/nationalAddress.service";

// On-demand short-code resolution, triggered by the user (blur/button),
// not cached list data — a mutation fits better than a query here.
export function useResolveShortAddress() {
  return useMutation<
    ResolveAddressRes,
    Error,
    { shortAddress: string; language?: "A" | "E" }
  >({
    mutationFn: ({ shortAddress, language }) =>
      resolveShortAddress(shortAddress, language),
  });
}

// Map-pin fallback: reverse-geocode a picked point into a National Address.
export function useGeocodeCoordinates() {
  return useMutation<
    ResolveAddressRes,
    Error,
    { lat: number; long: number; language?: "A" | "E" }
  >({
    mutationFn: ({ lat, long, language }) =>
      geocodeCoordinates(lat, long, language),
  });
}
