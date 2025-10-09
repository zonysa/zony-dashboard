import { apiCall } from "@/lib/services/apiClient";
import {
  LoginFormData,
  RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  OtpFormData,
} from "@/lib/schema/auth.js";

// Real API functions
export const login = async (data: LoginFormData) => {
  return apiCall({
    method: "POST",
    url: "/auth/login",
    data,
  });
};

export const register = async (data: RegisterFormData) => {
  return apiCall({
    method: "POST",
    url: "/auth/register",
    data,
  });
};

export const forgotPassword = async (data: ForgotPasswordFormData) => {
  return apiCall({
    method: "POST",
    url: "/auth/forgot-password",
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

export const verifyOtp = async (data: OtpFormData) => {
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
