import { apiCall } from "../client-backup.js";
import { mockAuthApi } from "../mock-service.js";
import {
  LoginFormData,
  //   RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  OtpFormData,
} from "@/lib/schema/auth.js";

const IS_MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK_API === "true";

// Real API functions
const realAuthApi = {
  login: async (data: LoginFormData) => {
    return apiCall({
      method: "POST",
      url: "/auth/login",
      data,
    });
  },

  //   register: async (data: RegisterFormData) => {
  //     return apiCall({
  //       method: "POST",
  //       url: "/auth/register",
  //       data,
  //     });
  //   },

  forgotPassword: async (data: ForgotPasswordFormData) => {
    return apiCall({
      method: "POST",
      url: "/auth/forgot-password",
      data,
    });
  },

  resetPassword: async (data: ResetPasswordFormData) => {
    return apiCall({
      method: "POST",
      url: "/auth/reset-password",
      data,
    });
  },

  verifyOtp: async (data: OtpFormData) => {
    return apiCall({
      method: "POST",
      url: "/auth/verify-otp",
      data,
    });
  },

  refreshToken: async (refreshToken: string) => {
    return apiCall({
      method: "POST",
      url: "/auth/refresh",
      data: { refreshToken },
    });
  },

  logout: async () => {
    return apiCall({
      method: "POST",
      url: "/auth/logout",
    });
  },
};

// Export the appropriate API based on environment
export const authApi = IS_MOCK_MODE ? mockAuthApi : realAuthApi;
