// lib/api/mock-service.ts - Mock API service
import {
  mockUsers,
  mockCredentials,
  mockTokens,
  mockOtpCodes,
} from "@/lib/data/mocks/data";

import {
  LoginFormData,
  //   RegisterFormData,
  ForgotPasswordFormData,
  ResetPasswordFormData,
  OtpFormData,
} from "@/lib/schema/auth";

import {
  ProfileUpdateFormData,
  ChangePasswordFormData,
} from "@/lib/schema/user";

// Mock API delay to simulate network requests
const mockDelay = (ms: number = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock API Error class
export class MockApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "MockApiError";
  }
}

// Mock Auth API
export const mockAuthApi = {
  login: async (data: LoginFormData) => {
    await mockDelay(800);

    const credential = mockCredentials.find(
      (cred) =>
        cred.emailOrPhone === data.emailOrPhone &&
        cred.password === data.password
    );

    if (!credential) {
      throw new MockApiError(401, "Invalid email/phone or password");
    }

    const user = mockUsers.find((u) => u.id === credential.userId);

    return {
      success: true,
      message: "Login successful",
      data: {
        user,
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      },
    };
  },

  //   register: async (data: RegisterFormData) => {
  //     await mockDelay(1200);

  //     // Check if email already exists
  //     const existingUser = mockUsers.find(u => u.email === data.email);
  //     if (existingUser) {
  //       throw new MockApiError(409, "Email already registered");
  //     }

  //     const newUser = {
  //       id: Date.now(),
  //       email: data.email,
  //       phone: data.phone || "",
  //       firstName: data.firstName,
  //       lastName: data.lastName,
  //       avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
  //       dateOfBirth: "",
  //       bio: "",
  //       isVerified: false,
  //     };

  //     // Add to mock users (in real app, this would be saved to database)
  //     mockUsers.push(newUser);

  //     return {
  //       success: true,
  //       message: "Registration successful. Please verify your email.",
  //       data: { user: newUser },
  //     };
  //   },

  forgotPassword: async (data: ForgotPasswordFormData) => {
    await mockDelay(500);

    const user = mockUsers.find((u) => u.email === data.email);
    if (!user) {
      // In production, you might still return success for security
      throw new MockApiError(404, "Email not found");
    }

    return {
      success: true,
      message: "Password reset email sent successfully",
    };
  },

  resetPassword: async (data: ResetPasswordFormData) => {
    await mockDelay(800);

    // Mock token validation
    if (data.token !== "mock-reset-token") {
      throw new MockApiError(400, "Invalid or expired reset token");
    }

    return {
      success: true,
      message: "Password reset successfully",
    };
  },

  verifyOtp: async (data: OtpFormData) => {
    await mockDelay(600);

    const expectedOtp = mockOtpCodes[data.email || ""];
    if (!expectedOtp || expectedOtp !== data.otp) {
      throw new MockApiError(400, "Invalid OTP code");
    }

    const user = mockUsers.find((u) => u.email === data.email);
    if (user) {
      user.isVerified = true;
    }

    return {
      success: true,
      message: "OTP verified successfully",
      data: {
        user,
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      },
    };
  },

  refreshToken: async (refreshToken: string) => {
    await mockDelay(300);

    if (refreshToken !== mockTokens.refreshToken) {
      throw new MockApiError(401, "Invalid refresh token");
    }

    return {
      success: true,
      data: {
        token: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      },
    };
  },

  logout: async () => {
    await mockDelay(200);
    return {
      success: true,
      message: "Logged out successfully",
    };
  },
};

// Mock User API
export const mockUserApi = {
  getProfile: async (token: string) => {
    await mockDelay(400);

    if (token !== mockTokens.accessToken) {
      throw new MockApiError(401, "Invalid or expired token");
    }

    return {
      success: true,
      data: { user: mockUsers[0] },
    };
  },

  updateProfile: async (data: ProfileUpdateFormData, token: string) => {
    await mockDelay(800);

    if (token !== mockTokens.accessToken) {
      throw new MockApiError(401, "Invalid or expired token");
    }

    // Update mock user data
    const userIndex = mockUsers.findIndex((u) => u.id === 1);
    if (userIndex !== -1) {
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
    }

    return {
      success: true,
      message: "Profile updated successfully",
      data: { user: mockUsers[userIndex] },
    };
  },

  changePassword: async (data: ChangePasswordFormData, token: string) => {
    await mockDelay(600);

    if (token !== mockTokens.accessToken) {
      throw new MockApiError(401, "Invalid or expired token");
    }

    // Mock current password validation
    if (data.currentPassword !== "password123") {
      throw new MockApiError(400, "Current password is incorrect");
    }

    return {
      success: true,
      message: "Password changed successfully",
    };
  },
};
