import {
  GetUsersRes,
  UserFormData,
  userFilterOptions,
  GetUserRes,
} from "../schema/user.schema";
import { apiCall } from "./apiClient";

// Create User
export const createUser = async (data: UserFormData) => {
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
  if (filters?.page) params.append("page", filters.page.toString());

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
