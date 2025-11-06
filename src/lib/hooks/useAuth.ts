"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  login,
  register,
  requestPassword,
  verifyOtp,
  logout,
  getUsers,
  getUser,
  resetPassword,
} from "@/lib/services/auth.service";
import { GetUsersRes } from "../schema/user.schema";
import {
  LoginFormData,
  LoginResponse,
  RegisterResponse,
  RequestPasswordResponse,
  VerifyOtpResponse,
} from "../schema/auth.schema";
import { useAuthStore } from "@/lib/stores/auth-store";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: { role_id?: string | number }) =>
    [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string | number) => [...userKeys.details(), id] as const,
};

// Get all users hook
export function useGetUsers(filters?: { role_id?: string | number }) {
  return useQuery<GetUsersRes, Error>({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Get user by ID hook
export function useGetUser(id: string | number, enabled = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUser(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export const useResetPassword = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      router.replace(
        "/auth/login?message=Password reset successfully. Please sign in with your new password."
      );
    },
    onError: (error) => {
      console.error("Reset password error:", error);
    },
  });
};

// Login hook
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation<LoginResponse, Error, LoginFormData>({
    mutationFn: login,
    onSuccess: (response) => {
      const {
        user,
        access_token: token,
        refresh_token: refreshToken,
      } = response;

      // Store tokens
      localStorage.setItem("authToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Update cache with user data
      queryClient.setQueryData(["user", "profile"], { data: { user } });

      // Update Zustand auth store
      if (user) {
        setUser(user);
      }

      // Show success message
      toast.success("Success", {
        description: "Login successful!",
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });

      // Redirect to dashboard
      router.push("/");
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      toast(error.message || "Login failed. Please try again.", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });
}

// Register hook
export function useRegister() {
  return useMutation({
    mutationFn: register,
    onSuccess: (res: RegisterResponse) => {
      // toast.success("Registration successful! Please verify your email.");

      // Store email for OTP verification
      const email = res.user.email;
      console.log(res);
      sessionStorage.setItem("pendingVerificationEmail", email);
    },
    onError: (error: Error) => {
      console.error("Registration failed:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    },
  });
}

// Forgot password hook
export function useRequestPassword() {
  return useMutation({
    mutationFn: requestPassword,
  });
}

// OTP verification hook
export function useVerifyOtp() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response: VerifyOtpResponse) => {
      const { user, access_token, refresh_token } = response;

      // Store tokens
      localStorage.setItem("authToken", access_token || "");
      if (refresh_token) {
        localStorage.setItem("refreshToken", refresh_token);
      }

      // Clear pending verification email
      sessionStorage.removeItem("pendingVerificationEmail");

      // Update cache with user data
      queryClient.setQueryData(["user", "profile"], { data: { user } });

      // Update Zustand auth store
      if (user) {
        setUser(user);
      }

      // Show success message
      toast.success("Email verified successfully!");

      // Redirect to dashboard
      router.push("/dashboard");
    },
    onError: (error: Error) => {
      console.error("OTP verification failed:", error);
      toast.error(error.message || "Invalid OTP. Please try again.");
    },
  });
}

// Logout hook
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutStore = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();

      // Clear all cached data
      queryClient.clear();

      // Clear Zustand auth store
      logoutStore();

      // Show success message
      toast.success("Logged out successfully");

      // Redirect to login
      router.push("/login");
    },
    onError: (error: Error) => {
      // Even if API call fails, clear local data
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();
      queryClient.clear();

      // Clear Zustand auth store
      logoutStore();

      console.error("Logout error:", error);
      router.push("/login");
    },
  });
}
