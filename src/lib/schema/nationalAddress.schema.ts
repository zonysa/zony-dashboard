// Saudi National Address (SPL) resolve/geocode types.
// Mirrors the normalized shape returned by the backend's
// NationalAddressService (app/core/services/national_address.py).
export interface ResolvedNationalAddress {
  short_address: string | null;
  address: string | null;
  city: string | null;
  district: string | null;
  region: string | null;
  postal_code: string | null;
  building_number: string | null;
  additional_number: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface ResolveAddressRes {
  status: "success" | "error";
  message: string;
  address: ResolvedNationalAddress;
}
