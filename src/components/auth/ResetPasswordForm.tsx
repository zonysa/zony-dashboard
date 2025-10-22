"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import {
  ResetPasswordFormData,
  resetPasswordSchema,
} from "@/lib/schema/auth.schema";
import { useResetPassword } from "@/lib/hooks/useAuth";

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token") || "";
  console.log("Token from URL:", token); // Add this

  // Reset password mutation
  const resetPasswordMutation = useResetPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      new_password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log("Form submitted!", data); // Add this
    console.log("Token:", token); // Add this

    if (!token) {
      form.setError("new_password", {
        message: "Invalid reset link. Please request a new password reset.",
      });
      return;
    }

    resetPasswordMutation.mutate({
      token,
      new_password: data.new_password,
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

  const passwordStrength = getPasswordStrength(
    form.watch("new_password") || ""
  );
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
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* New Password Field */}
              <FormField
                control={form.control}
                name="new_password"
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
                        form.watch("new_password")?.length >= 8
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
                        /[a-z]/.test(form.watch("new_password") || "")
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
                        /[A-Z]/.test(form.watch("new_password") || "")
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
                        /\d/.test(form.watch("new_password") || "")
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
                disabled={resetPasswordMutation.isPending}
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
