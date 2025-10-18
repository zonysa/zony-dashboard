import z from "zod";

// Base Schema
export const CitySchema = z.object({
  name: z.string(),
});

// Types
export type CityFormData = z.infer<typeof CitySchema>;

// Base City
export interface CityBase {
  name: string;
}

export interface CityRes extends CityBase {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCityRes {
  message: string;
  status: "success" | "error";
  city: CityRes;
}

export interface GetCitiesRes {
  message: string;
  status: "success" | "error";
  cities: CityRes[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_cities: number;
  total_pages: number;
}
