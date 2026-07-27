import {
  CityDetails,
  CreateCityRes,
  GetCitiesRes,
  GetCityRes,
} from "@/lib/schema/city.schema";
import { apiCall } from "../apiClient";

// Create City
export const createCity = async (data: CityDetails): Promise<CreateCityRes> => {
  return apiCall({
    method: "POST",
    url: "/cities",
    data,
  });
};

// Get Cities
export interface GetCitiesFilter {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getCities = async (
  filters?: GetCitiesFilter
): Promise<GetCitiesRes> => {
  const params = new URLSearchParams();

  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.per_page)
    params.append("per_page", filters.per_page.toString());
  if (filters?.search) params.append("search", filters.search);
  params.append("capitals_only", "true");

  const queryString = params.toString();
  return apiCall({
    method: "GET",
    url: `/cities${queryString ? `?${queryString}` : ""}`,
  });
};

// Get City by ID
export const getCity = async (id: number): Promise<GetCityRes> => {
  return apiCall({
    method: "GET",
    url: `/cities/${id}`,
  });
};

// Update City by ID
export const updateCity = async (id: number, data: Partial<CityDetails>) => {
  return apiCall({
    method: "PATCH",
    url: `/cities/${id}`,
    data,
  });
};

// Delete City by ID
export const deleteCity = async (id: number) => {
  return apiCall({
    method: "DELETE",
    url: `/cities/${id}`,
  });
};
