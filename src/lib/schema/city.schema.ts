import z from "zod";

export type CityDetails = {
  id?: number;
  name: string;
  created_at?: string;
  updated_at?: string;
};

export interface CreateCityRes {
  message: string;
  status: "success" | "error";
  city: CityDetails;
}

export interface GetCitiesRes {
  message: string;
  status: "success" | "error";
  cities: CityDetails[];
  current_page: number;
  next_page: number | null;
  prev_page: number | null;
  total_cities: number;
  total_pages: number;
}

export type GetCityRes = {
  message: string;
  city: CityDetails;
  status: "success" | "error";
};

// Base Schema
export const CitySchema = z.object({
  name: z.string(),
});

export type CityFormData = z.infer<typeof CitySchema>;
