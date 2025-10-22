import { z } from "zod";

export type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  avatar: string | null;
  birth_date: string | null;
  city: string | null;
  country: string | null;
  gender: string | null;
  identity: string | null;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
};

export const emailSchema = z.string().min(1, "Email is required");

export const phoneSchema = z
  .string()
  .regex(/^[\d\s\-\+\(\)]{10,}$/, "Please enter a valid phone number");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(50, "Password must be less than 50 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export interface login {
  email: string;
  password: string;
  remember_me: boolean;
}
// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
  remember_me: z.boolean().default(true),
});

// Register Schema
export const registerSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be less than 30 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10,15}$/, "Please enter a valid phone number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  roleId: z
    .number({
      error: "Role is required",
    })
    .int()
    .min(1, "Invalid role")
    .max(7, "Invalid role"),
});

// Forgot password schema
export const requestPasswordSchema = z.object({
  email: emailSchema,
});

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Reset password schema
export const resetPasswordSchema = z
  .object({
    token: z.string().optional(),
    new_password: passwordSchema,
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.new_password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// OTP verification schema
export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d+$/, "OTP must contain only numbers"),
  email: z.string().email().optional(),
});

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user?: User; // optionally include user data
};

export type RegisterRequest = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
};

export type RegisterResponse = {
  user: User;
  message?: string;
};

export interface RequestPasswordResponse {
  message: string;
  success: boolean;
}

export type VerifyOtpResponse = {
  message: string;
  success: boolean;
  user?: User;
  access_token?: string;
  refresh_token?: string;
};

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type RequestPasswordFormData = z.infer<typeof requestPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type OtpFormData = z.infer<typeof otpSchema>;
