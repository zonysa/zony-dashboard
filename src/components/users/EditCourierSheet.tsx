"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetUser, useUpdateUser } from "@/lib/hooks/useUsers";
import { optionalUsernameSchema } from "@/lib/schema/auth.schema";
import { ApiError } from "@/lib/services/apiClient";
import {
  normalizeSaudiPhone,
  optionalSaudiPhoneSchema,
  toOptionalE164SaudiPhone,
} from "@/lib/validators/phone";

// Same field rules as creating a user, except the password: blank keeps the
// current one, anything else replaces it. No `is_active`: PATCH /users
// rejects it as an unknown field.
const editCourierSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  username: optionalUsernameSchema,
  email: z.string().trim().email("Please enter a valid email address"),
  phone_number: optionalSaudiPhoneSchema,
  password: z.union([
    z.literal(""),
    z.string().min(8, "Password must be at least 8 characters"),
  ]),
});

const PASSWORD_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function generateSecurePassword(length = 12) {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(
    randomValues,
    (value) => PASSWORD_CHARSET[value % PASSWORD_CHARSET.length],
  ).join("");
}
type EditCourierInput = z.input<typeof editCourierSchema>;
type EditCourierData = z.output<typeof editCourierSchema>;

// Matches the backend's uniqueness errors to the field they're about.
const CONFLICT_FIELDS: [RegExp, "email" | "username" | "phone_number"][] = [
  [/email/i, "email"],
  [/username/i, "username"],
  [/phone/i, "phone_number"],
];

const EMPTY_VALUES: EditCourierInput = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
};

/**
 * Edit a courier's account from the Couriers table. The list row doesn't
 * carry every field, so the account is fetched when the sheet opens.
 * `userId` null keeps it closed.
 */
export function EditCourierSheet({
  userId,
  onOpenChange,
}: {
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { t, isRTL } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { data, isLoading, isError } = useGetUser(userId ?? "");
  const user = data?.user;
  const updateUser = useUpdateUser(userId ?? "");

  const form = useForm<EditCourierInput, unknown, EditCourierData>({
    resolver: zodResolver(editCourierSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onChange",
  });
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  // Seeded when the account arrives, and again when another courier is
  // opened — the sheet stays mounted between rows.
  useEffect(() => {
    if (!user) {
      reset(EMPTY_VALUES);
      return;
    }
    reset({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      username: user.username ?? "",
      email: user.email ?? "",
      phone_number: user.phone_number
        ? normalizeSaudiPhone(user.phone_number)
        : "",
      password: "",
    });
    setShowPassword(false);
  }, [user, reset]);

  function handleGeneratePassword() {
    form.setValue("password", generateSecurePassword(), {
      shouldValidate: true,
      shouldDirty: true,
    });
    setShowPassword(true);
  }

  async function handleCopyPassword() {
    const password = form.getValues("password");
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.success(t("forms.actions.copied"));
    } catch {
      toast.error(t("forms.actions.copyFailed"));
    }
  }

  async function onSubmit(values: EditCourierData) {
    if (!userId) return;
    try {
      await updateUser.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        // Blank means "leave as is", not "clear it": the backend requires a
        // username, and an empty phone would become a bare "+966".
        ...(values.username ? { username: values.username } : {}),
        ...(values.phone_number
          ? { phone_number: toOptionalE164SaudiPhone(values.phone_number) }
          : {}),
        ...(values.password ? { password: values.password } : {}),
      });
      toast.success(t("couriers.edit.success"));
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      toast.error(message || t("couriers.edit.error"));
      const field = CONFLICT_FIELDS.find(([p]) => p.test(message))?.[1];
      if (err instanceof ApiError && err.status === 409 && field) {
        form.setError(field, { message });
      }
    }
  }

  return (
    <Sheet open={!!userId} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRTL ? "left" : "right"}
        className="overflow-y-auto px-6 sm:max-w-[625px]"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            {t("couriers.edit.title")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t("couriers.edit.description")}
          </SheetDescription>
        </SheetHeader>

        {isError ? (
          <p className="mt-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {t("users.loadingError")}
          </p>
        ) : isLoading || !user ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.fields.firstName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("forms.placeholders.enterFirstName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.fields.lastName")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("forms.placeholders.enterLastName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.username")}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        placeholder={t("forms.placeholders.enterUsername")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.email")}</FormLabel>
                    <FormControl>
                      <Input
                        dir="ltr"
                        type="email"
                        placeholder={t("forms.placeholders.enterEmail")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.phoneNumber")}</FormLabel>
                    <FormControl>
                      <PhoneInput {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("couriers.edit.passwordSection")}
                </h3>
                <FormField
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("forms.fields.newPassword")}{" "}
                        {t("forms.fields.optional")}
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            dir="ltr"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder={t(
                              "forms.placeholders.enterNewPassword",
                            )}
                            className="pr-28 rtl:pl-28 rtl:pr-3"
                            {...field}
                          />
                          <div className="absolute end-0 top-0 flex h-full items-center">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-full px-2 hover:bg-transparent"
                              title={t("forms.actions.generatePassword")}
                              onClick={handleGeneratePassword}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-full px-2 hover:bg-transparent"
                              title={t("forms.actions.copyPassword")}
                              onClick={handleCopyPassword}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-full px-2 hover:bg-transparent"
                              title={
                                showPassword
                                  ? t("forms.actions.hidePassword")
                                  : t("forms.actions.showPassword")
                              }
                              onClick={() => setShowPassword((v) => !v)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("couriers.edit.passwordHint")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <SheetFooter className="w-full gap-2 border-t px-0 pt-6 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onOpenChange(false)}
                >
                  {t("forms.actions.cancel")}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting || !isDirty}
                >
                  {isSubmitting ? t("common.saving") : t("forms.actions.save")}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
