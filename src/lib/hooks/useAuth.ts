import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  login,
  register,
  forgotPassword,
  verifyOtp,
  logout,
} from "@/lib/services/auth.service";
import { ForgotPasswordResponse } from "@/lib/schema/auth.schema";

interface LoginInput {
  email: string;
  password: string;
  remember_me: boolean;
}

type user = {
  email: string;
  last_login: string;
  role: string;
  username: string;
};

interface LoginResponse {
  access_token: string;
  message: string;
  refresh_token: string;
  status: string;
  user: user;
}

// Login hook
export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginInput>({
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
    onSuccess: (res) => {
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
export function useForgotPassword() {
  return useMutation<ForgotPasswordResponse, Error, string>({
    mutationFn: forgotPassword,
    onSuccess: (response) => {
      toast(response.message || "Password reset email sent!", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },
    onError: (error: Error) => {
      console.error("Forgot password failed:", error);
      toast(error.message || "Password reset email sent!", {
        action: {
          label: "Undo",
          onClick: () => console.log("Undo"),
        },
      });
    },
  });
}

// OTP verification hook
export function useVerifyOtp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      const { user, token, refreshToken } = response.data;

      // Store tokens
      localStorage.setItem("authToken", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }

      // Clear pending verification email
      sessionStorage.removeItem("pendingVerificationEmail");

      // Update cache with user data
      queryClient.setQueryData(["user", "profile"], { data: { user } });

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

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear tokens
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.clear();

      // Clear all cached data
      queryClient.clear();

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

      console.error("Logout error:", error);
      router.push("/login");
    },
  });
}

// Get current user hook
// export function useCurrentUser() {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

//   return useQuery({
//     queryKey: ['user', 'profile'],
//     queryFn: async () => {
//       if (!token) throw new Error('No auth token');
//       return authApi.getProfile?.(token) || { data: { user: null } };
//     },
//     enabled: !!token,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     retry: 1,
//   });
// }
