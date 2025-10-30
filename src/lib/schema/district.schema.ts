import z from "zod";

export interface DistrictDetails {
  id?: number; // might be returned later in GET
  city_id: number;
  name: string;
  zone_id: number | null;
}

export type CreateDistrict = Omit<DistrictDetails, "id">;

export interface CreateDistrictRes {
  district: DistrictDetails;
  message: string;
  status: "success" | "error";
}

export interface GetDistrictsRes {
  status: string;
  message: string;
  current_page: number;
  total_pages: number;
  total_districts: number;
  next_page: number | null;
  prev_page: number | null;
  districts: DistrictDetails[];
}

// Base Schema
export const DistrictSchema = z.object({
  name: z.string(),
  city_id: z.number(),
  zone_id: z.number().nullable(),
});

// Types
export type DistrictFormData = z.infer<typeof DistrictSchema>;
