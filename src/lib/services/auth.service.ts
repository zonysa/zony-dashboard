import { apiCall } from "@/lib/services/apiClient";
import {
  LoginFormData,
  RequestPasswordFormData,
  ResetPasswordFormData,
  OtpFormData,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RequestPasswordResponse,
  VerifyOtpResponse,
} from "@/lib/schema/auth.schema.js";
import { RegisterApiRequest } from "@/lib/types/api.types";
import { GetUserRes, GetUsersRes } from "../schema/user.schema";

// Get all users
export const getUsers = async (filters?: {
  role_id?: string | number;
}): Promise<GetUsersRes> => {
  return apiCall({
    method: "GET",
    url: "/users",
    params: filters,
  });
};

// Get user by ID
export const getUser = async (id: string | number) => {
  return apiCall({
    method: "GET",
    url: `/users/${id}`,
  });
};

// Real API functions
export const login = async (data: LoginFormData): Promise<LoginResponse> => {
  return apiCall({
    method: "POST",
    url: "/auth/login",
    data,
  });
};

export const register = async (
  data: RegisterApiRequest
): Promise<RegisterResponse> => {
  return apiCall({
    method: "POST",
    url: "/auth/register",
    data,
  });
};

export const requestPassword = async (
  data: RequestPasswordFormData
): Promise<RequestPasswordResponse> => {
  return apiCall({
    method: "POST",
    url: "/auth/request-reset",
    data,
  });
};

export const resetPassword = async (data: ResetPasswordFormData) => {
  return apiCall({
    method: "POST",
    url: "/auth/reset-password",
    data,
  });
};

export const verifyOtp = async (
  data: OtpFormData
): Promise<VerifyOtpResponse> => {
  return apiCall({
    method: "POST",
    url: "/auth/verify-otp",
    data,
  });
};

export const refreshToken = async (refreshToken: string) => {
  return apiCall({
    method: "POST",
    url: "/auth/refresh",
    data: { refreshToken },
  });
};

export const logout = async () => {
  return apiCall({
    method: "POST",
    url: "/auth/logout",
  });
};
