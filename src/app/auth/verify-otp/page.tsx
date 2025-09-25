"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Import our validation schema and hook
import { otpSchema, OtpFormData } from "@/lib/schema/auth";
import { useVerifyOtp } from "@/hooks/useAuth";

interface OTPRouteParams {
  email: string;
  type: "email_verification" | "password_reset";
  from: "login" | "forgot_password";
}

export default function VerifyOtpPage() {
  const router = useRouter();
  const verifyOtpMutation = useVerifyOtp();
  const { email: userEmall, type, from } = useSearchParams<OTPRouteParams>();

  // Get email from session storage (set during registration)
  const [email, setEmail] = React.useState<string>("");

  useEffect(() => {
    sessionStorage.setItem("pendingVerificationEmail", "123456");
    const pendingEmail = sessionStorage.getItem("pendingVerificationEmail");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no pending email, redirect to login
      router.push("/");
    }
  }, [router]);

  const form = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = form.watch("otp");
  const isComplete = otpValue.length === 6;

  const onSubmit = (data: OtpFormData) => {
    // verifyOtpMutation.mutate({
    //   ...data,
    //   email: email, // Ensure email is included
    // });
    switch (from) {
      case "login":
        // Complete the login process
        router.replace("/"); // or wherever users go after login
        break;

      case "forgot_password":
        // Navigate to reset password with token
        router.push({
          pathname: "/reset-password",
          params: {
            email,
            token: data?.token || "verified",
          },
        });
        break;

      default:
        // Fallback
        router.back();
    }
  };

  const handleResendOtp = () => {
    // In a real app, this would trigger a resend OTP API call
    console.log("Resend OTP for:", email);
    // You could show a toast message here
    alert("OTP resent to " + email);
  };

  if (!email) {
    return (
      <div className="w-full flex flex-col gap-10 items-center justify-center md:p-10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p>Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-10 items-center justify-center md:p-10">
      <Image
        className="absolute right-0 bottom-0 -z-0"
        src="/icons/login-illustration.svg"
        alt="Login Illustration"
        width={630}
        height={388}
      />
      {/* Test credentials info for development */}
      {process.env.NEXT_PUBLIC_USE_MOCK_API === "true" && (
        <Card className="w-full max-w-md border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <p className="text-sm text-green-700 font-medium mb-2">Test OTP:</p>
            <div className="text-xs text-green-600">
              <p>
                Use OTP: <strong>123456</strong>
              </p>
              <p>For email: {email}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="w-full max-w-md z-1">
        <CardHeader>
          <CardTitle className="text-center">
            Enter Code sent to your email
          </CardTitle>
          <p className="text-sm text-gray-600 text-center mt-2">
            We sent a 6-digit code to{" "}
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">OTP Code</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP
                          maxLength={6}
                          value={field.value}
                          onChange={field.onChange}
                          disabled={verifyOtpMutation.isPending}
                        >
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                          </InputOTPGroup>
                          <InputOTPSeparator />
                          <InputOTPGroup>
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full py-3.5"
                disabled={!isComplete || form.formState.isSubmitting}
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              {/* Display error if any */}
              {verifyOtpMutation.error && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-md">
                  {verifyOtpMutation.error.message}
                </div>
              )}

              {/* Resend OTP */}
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOtp}
                  disabled={verifyOtpMutation.isPending}
                  className="text-primary hover:text-primary/80"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Back to login link */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => router.push("/auth/login")}
          disabled={verifyOtpMutation.isPending}
        >
          ← Back to Login
        </Button>
      </div>
    </div>
  );
}
