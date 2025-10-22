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
export const getCities = async (): Promise<GetCitiesRes> => {
  return apiCall({
    method: "GET",
    url: "/cities",
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
