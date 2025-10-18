import { CreateDistrict } from "@/lib/schema/district.schema";
import { apiCall } from "../apiClient";

export const createDistrict = async (data: CreateDistrict) => {
  return apiCall({
    method: "POST",
    url: "/districts",
    data,
  });
};

export const getDistricts = async (cityId?: number) => {
  const params = new URLSearchParams();

  if (cityId) {
    params.append("city", cityId.toString());
  }

  const queryString = params.toString();
  const url = `/districts${queryString ? `?${queryString}` : ""}`;
  return apiCall({
    method: "GET",
    url,
  });
};
