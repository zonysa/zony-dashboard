import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";

// Reset password schema
const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// API function for resetting password
const resetPasswordAPI = async (data: ResetPasswordRequest) => {
  // Replace with your actual API endpoint
  const response = await fetch("/api/auth/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to reset password");
  }

  return response.json();
};

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get email and token from URL parameters
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordAPI,
    onSuccess: () => {
      // Redirect to login with success message
      router.replace(
        "/auth/login?message=Password reset successfully. Please sign in with your new password."
      );
    },
    onError: (error: any) => {
      console.error("Reset password error:", error);
    },
  });

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    if (!email || !token) {
      form.setError("newPassword", {
        message: "Invalid reset link. Please request a new password reset.",
      });
      return;
    }

    resetPasswordMutation.mutate({
      email,
      token,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    });
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^a-zA-Z\d]/.test(password)) strength += 1;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.watch("newPassword") || "");
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create New Password</CardTitle>
          <p className="text-sm text-gray-600">
            {email
              ? `Create a new password for ${email}`
              : "Enter your new password below"}
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password Field */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel htmlFor="newPassword" className="font-normal">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter your new password"
                          disabled={resetPasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={resetPasswordMutation.isPending}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div className="mt-2">
                        <div className="flex space-x-1 mb-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-1 w-full rounded-full",
                                passwordStrength >= level
                                  ? strengthColors[passwordStrength - 1]
                                  : "bg-gray-200"
                              )}
                            />
                          ))}
                        </div>
                        {passwordStrength > 0 && (
                          <p className="text-xs text-gray-600">
                            Password strength:{" "}
                            {strengthLabels[passwordStrength - 1]}
                          </p>
                        )}
                      </div>
                    )}

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel
                      htmlFor="confirmPassword"
                      className="font-normal"
                    >
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your new password"
                          disabled={resetPasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={resetPasswordMutation.isPending}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Password Requirements:
                </p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className="flex items-center">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        form.watch("newPassword")?.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        /[a-z]/.test(form.watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                    One lowercase letter
                  </li>
                  <li className="flex items-center">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        /[A-Z]/.test(form.watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                    One uppercase letter
                  </li>
                  <li className="flex items-center">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full mr-2",
                        /\d/.test(form.watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      )}
                    />
                    One number
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full mt-6 py-3.5"
                disabled={
                  resetPasswordMutation.isPending || !form.formState.isValid
                }
              >
                {resetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>

              {/* Display error if any */}
              {resetPasswordMutation.error && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-md">
                  {resetPasswordMutation.error.message}
                </div>
              )}

              {/* Back to Login Link */}
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Back to Sign In
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
