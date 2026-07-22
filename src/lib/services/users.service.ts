import {
  GetUsersRes,
  UserFormData,
  userFilterOptions,
  GetUserRes,
  CreateUserRequest,
  GetAvailableResponsiblesRes,
  GetAvailableRepresentativesRes,
} from "../schema/user.schema";
import { apiCall } from "./apiClient";

// Create User (admin-provisioned: no email OTP, active immediately)
export const createUser = async (data: CreateUserRequest): Promise<GetUserRes> => {
  return apiCall({
    method: "POST",
    url: "/users",
    data,
  });
};

// Get Users
export const getUsers = async (
  filters?: userFilterOptions
): Promise<GetUsersRes> => {
  const params = new URLSearchParams();
  if (filters?.is_active !== undefined)
    params.append("is_active", filters.is_active.toString());
  if (filters?.role_id) params.append("role_id", String(filters.role_id));
  if (filters?.city) params.append("city", filters.city);
  if (filters?.district) params.append("district", filters.district);
  if (filters?.zone) params.append("zone", filters.zone);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.search) params.append("search", filters.search);
  if (filters?.page) params.append("page", filters.page.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());

  return apiCall({
    method: "GET",
    url: `/users${params.toString() ? `?${params.toString()}` : ""}`,
  });
};

// Get User by ID
export const getUser = async (id: string): Promise<GetUserRes> => {
  return apiCall({
    method: "GET",
    url: `/users/${id}`,
  });
};

// Update User by ID
export const updateUser = async (id: string, data: Partial<UserFormData>) => {
  return apiCall({
    method: "PATCH",
    url: `/users/${id}`,
    data,
  });
};

// Delete User by ID
export const deleteUser = async (id: string) => {
  return apiCall({
    method: "DELETE",
    url: `/users/${id}`,
  });
};

// Get Available Responsibles
export const getAvailableResponsibles = async (): Promise<GetAvailableResponsiblesRes> => {
  return apiCall({
    method: "GET",
    url: "/users/available-responsibles",
  });
};

// Get Available Representatives
export const getAvailableRepresentatives = async (): Promise<GetAvailableRepresentativesRes> => {
  return apiCall({
    method: "GET",
    url: "/users/available-representatives",
  });
};
