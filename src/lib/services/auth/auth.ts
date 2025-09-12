// lib/api/auth.ts - Complete mock API (replace your current file)
import {
  LoginFormData,
  //   RegisterFormData,
  ForgotPasswordFormData,
  OtpFormData,
} from "@/lib/schema/auth";

// Simple delay function to simulate network requests
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Development OTP - always works in development
const DEV_OTP = process.env.NEXT_PUBLIC_DEV_OTP || "123456";
const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Mock users data
const mockUsers = [
  {
    id: 1,
    email: "test@example.com",
    phone: "+1234567890",
    firstName: "John",
    lastName: "Doe",
  },
  {
    id: 2,
    email: "jane@example.com",
    phone: "+1987654321",
    firstName: "Jane",
    lastName: "Smith",
  },
];

// Mock credentials
const mockCredentials = [
  { emailOrPhone: "test@example.com", password: "password123", userId: 1 },
  { emailOrPhone: "+1234567890", password: "password123", userId: 1 },
  { emailOrPhone: "jane@example.com", password: "password456", userId: 2 },
];

// Mock API - This replaces any Axios calls
export const authApi = {
  login: async (data: LoginFormData) => {
    console.log("🔐 Mock login called with:", data);
    await delay(800);

    // Find matching credentials
    const credential = mockCredentials.find(
      (cred) =>
        cred.emailOrPhone === data.emailOrPhone &&
        cred.password === data.password
    );

    if (!credential) {
      throw new Error("Invalid email/phone or password");
    }

    const user = mockUsers.find((u) => u.id === credential.userId);

    return {
      success: true,
      message: "Login successful",
      data: {
        user,
        token: "mock-jwt-token-" + Date.now(),
        refreshToken: "mock-refresh-token-" + Date.now(),
      },
    };
  },

  //   register: async (data: RegisterFormData) => {
  //     console.log("📝 Mock register called with:", data);
  //     await delay(1200);

  //     // Check if email already exists
  //     const existingUser = mockUsers.find((u) => u.email === data.email);
  //     if (existingUser) {
  //       throw new Error("Email already registered");
  //     }

  //     const newUser = {
  //       id: Date.now(),
  //       email: data.email,
  //       phone: data.phone || "",
  //       firstName: data.firstName,
  //       lastName: data.lastName,
  //     };

  //     // In a real app, this would be saved to database
  //     mockUsers.push(newUser);

  //     return {
  //       success: true,
  //       message: "Registration successful. Please verify your email.",
  //       data: {
  //         user: newUser,
  //       },
  //     };
  //   },

  forgotPassword: async (data: ForgotPasswordFormData) => {
    console.log("🔒 Mock forgot password called with:", data);
    await delay(600);

    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) {
      throw new Error("Email not found");
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  },

  verifyOtp: async (data: OtpFormData) => {
    console.log("✅ Mock verify OTP called with:", data);
    await delay(800);

    // Development mode: Accept dev OTP for any email
    if (IS_DEVELOPMENT && data.otp === DEV_OTP) {
      console.log("🔧 Using development OTP:", DEV_OTP);

      let user = mockUsers.find((user) => user.email === data.email);

      if (!user) {
        // Create a mock user if not found
        user = {
          id: Date.now(),
          email: data.email || "dev@example.com",
          phone: "",
          firstName: "Dev",
          lastName: "User",
        };
        mockUsers.push(user);
      }

      return {
        success: true,
        message: "OTP verified successfully (dev mode)",
        data: {
          user,
          token: "mock-jwt-token-dev-" + Date.now(),
          refreshToken: "mock-refresh-token-dev-" + Date.now(),
        },
      };
    } else {
      throw new Error("Invalid OTP code");
    }
  },

  logout: async () => {
    console.log("👋 Mock logout called");
    await delay(300);

    return {
      success: true,
      message: "Logged out successfully",
    };
  },
};
