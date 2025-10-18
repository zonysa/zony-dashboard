import { CityBase } from "@/lib/schema/city.schema";
import { apiCall } from "../apiClient";

export const createCity = async (data: CityBase) => {
  return apiCall({
    method: "POST",
    url: "/cities",
    data,
  });
};

export const getCities = async () => {
  return apiCall({
    method: "GET",
    url: "/cities",
  });
};
