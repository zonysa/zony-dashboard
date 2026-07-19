import { ResolveAddressRes } from "@/lib/schema/nationalAddress.schema";
import { apiCall } from "./apiClient";

// Resolve a National Address short code (e.g. "RQAA6355") into a full
// address preview: address, city, district, coordinates, etc.
export const resolveShortAddress = async (
  shortAddress: string,
  language: "A" | "E" = "A"
): Promise<ResolveAddressRes> => {
  const params = new URLSearchParams({
    short_address: shortAddress,
    language,
  });
  return apiCall({
    method: "GET",
    url: `/addresses/resolve?${params.toString()}`,
  });
};

// Reverse-geocode a picked map point into a National Address — the
// map-pin fallback when a short code can't be resolved.
export const geocodeCoordinates = async (
  lat: number,
  long: number,
  language: "A" | "E" = "A"
): Promise<ResolveAddressRes> => {
  const params = new URLSearchParams({
    lat: String(lat),
    long: String(long),
    language,
  });
  return apiCall({
    method: "GET",
    url: `/addresses/geocode?${params.toString()}`,
  });
};
