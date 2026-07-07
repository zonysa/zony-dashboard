"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { ApiError } from "@/lib/services/apiClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRegister } from "@/lib/hooks/useAuth";
import {
  CustomerSignupFormData,
  customerSignupSchema,
} from "@/lib/schema/auth.schema";
import { toE164SaudiPhone } from "@/lib/validators/phone";
import { readSignupDraft, saveSignupDraft } from "@/lib/auth/signupDraft";

const CUSTOMER_ROLE_ID = 7;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t, isRTL } = useTranslation();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailTaken, setEmailTaken] = useState(false);

  const registerMutation = useRegister();

  const form = useForm<CustomerSignupFormData>({
    resolver: zodResolver(customerSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      roleId: CUSTOMER_ROLE_ID,
    },
  });

  // Restore non-sensitive fields left over from an earlier visit (e.g. the
  // customer left mid-way, or came back to fix a mistake after being sent
  // to /auth/verify-otp).
  useEffect(() => {
    const draft = readSignupDraft();
    if (draft) {
      form.reset({
        ...draft,
        password: "",
        confirmPassword: "",
        roleId: CUSTOMER_ROLE_ID,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draft in sync as the customer types, so navigating away (even
  // without submitting) never loses their progress. Password is never saved.
  useEffect(() => {
    const subscription = form.watch((values) => {
      saveSignupDraft({
        firstName: values.firstName ?? "",
        lastName: values.lastName ?? "",
        username: values.username ?? "",
        email: values.email ?? "",
        phoneNumber: values.phoneNumber ?? "",
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Once the "email already registered" error has been shown, clear it as
  // soon as the customer edits the email field again.
  useEffect(() => {
    const subscription = form.watch((_values, { name }) => {
      if (name === "email" && emailTaken) {
        setEmailTaken(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, emailTaken]);

  const onSubmit = (data: CustomerSignupFormData) => {
    setEmailTaken(false);
    registerMutation.mutate(
      {
        first_name: data.firstName,
        last_name: data.lastName,
        username: data.username,
        email: data.email,
        phone_number: toE164SaudiPhone(data.phoneNumber),
        password: data.password,
        role_id: CUSTOMER_ROLE_ID,
      },
      {
        onSuccess: () => {
          toast.success(t("auth.signup.success"));
          router.push("/auth/verify-otp");
        },
        onError: (error) => {
          // Backend returns 409 for an email that already belongs to a
          // verified account. Surface it on the email field itself so it's
          // obvious which value needs to change, and offer a way to sign in
          // instead of re-typing everything.
          if (
            error instanceof ApiError &&
            error.status === 409 &&
            error.message.toLowerCase().includes("email")
          ) {
            form.setError("email", { type: "manual", message: error.message });
            setEmailTaken(true);
          }
        },
      }
    );
  };

  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.signup.formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <FormLabel className="font-normal">
                        {t("forms.fields.firstName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("forms.placeholders.enterFirstName")}
                          disabled={registerMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="grid gap-3">
                      <FormLabel className="font-normal">
                        {t("forms.fields.lastName")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder={t("forms.placeholders.enterLastName")}
                          disabled={registerMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel className="font-normal">
                      {t("forms.fields.username")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={t("forms.placeholders.enterUsername")}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel className="font-normal">
                      {t("forms.fields.email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={t("forms.placeholders.enterEmail")}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                    {emailTaken && (
                      <p className="text-sm text-muted-foreground">
                        {t("auth.signup.emailTakenSignInPrompt")}{" "}
                        <Link
                          href="/auth/login"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {t("auth.login.CTA")}
                        </Link>
                      </p>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel className="font-normal">
                      {t("forms.fields.phoneNumber")}
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        {...field}
                        disabled={registerMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel className="font-normal">
                      {t("forms.fields.password")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t("forms.placeholders.enterPassword")}
                          disabled={registerMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute ${
                            isRTL ? "left" : "right"
                          }-0 top-0 h-full px-3 py-2 hover:bg-transparent`}
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={registerMutation.isPending}
                        >
                          {showPassword ? (
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

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel className="font-normal">
                      {t("forms.fields.confirmPassword")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder={t("forms.placeholders.enterPassword")}
                          disabled={registerMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute ${
                            isRTL ? "left" : "right"
                          }-0 top-0 h-full px-3 py-2 hover:bg-transparent`}
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          disabled={registerMutation.isPending}
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

              <Button
                disabled={registerMutation.isPending}
                type="submit"
                className="w-full mt-6 py-3.5"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("forms.actions.creating")}
                  </>
                ) : (
                  t("auth.signup.CTA")
                )}
              </Button>

              {registerMutation.error && !emailTaken && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-md">
                  {registerMutation.error.message}
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
