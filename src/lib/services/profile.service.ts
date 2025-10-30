import {
  GetProfileRes,
  ProfileFormData,
} from "../schema/profile.schema";
import { apiCall } from "./apiClient";

// Get Profile
export const getProfile = async (): Promise<GetProfileRes> => {
  return apiCall({
    method: "GET",
    url: "/profile",
  });
};

// Update Profile
export const updateProfile = async (data: Partial<ProfileFormData>) => {
  return apiCall({
    method: "PATCH",
    url: "/profile",
    data,
  });
};
