import {
  CreateDistrict,
  CreateDistrictRes,
  GetDistrictsRes,
} from "@/lib/schema/district.schema";
import { apiCall } from "../apiClient";

export const createDistrict = async (
  data: CreateDistrict
): Promise<CreateDistrictRes> => {
  return apiCall({
    method: "POST",
    url: "/districts",
    data,
  });
};

export interface GetDistrictsFilter {
  page?: number;
  per_page?: number;
  search?: string;
}

export const getDistricts = async (
  cityId?: number,
  filters?: GetDistrictsFilter
): Promise<GetDistrictsRes> => {
  const params = new URLSearchParams();

  if (cityId) {
    params.append("city", cityId.toString());
  }
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.per_page)
    params.append("per_page", filters.per_page.toString());
  if (filters?.search) params.append("search", filters.search);

  const queryString = params.toString();
  const url = `/districts${queryString ? `?${queryString}` : ""}`;
  return apiCall({
    method: "GET",
    url,
  });
};
