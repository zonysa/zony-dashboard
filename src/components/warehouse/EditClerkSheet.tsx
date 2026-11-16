"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { warehouseKeys } from "@/lib/hooks/useWarehouse";
import {
  EditStaffUserFormData,
  EditStaffUserFormInput,
  editStaffUserSchema,
  UserFormData,
} from "@/lib/schema/user.schema";
import { ApiError } from "@/lib/services/apiClient";
import {
  normalizeSaudiPhone,
  toOptionalE164SaudiPhone,
} from "@/lib/validators/phone";

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

// Matches the backend's uniqueness errors to the field they're about.
const CONFLICT_FIELDS: [RegExp, "email" | "username" | "phone_number"][] = [
  [/email/i, "email"],
  [/username/i, "username"],
  [/phone/i, "phone_number"],
];

const EMPTY_VALUES: EditStaffUserFormInput = {
  first_name: "",
  last_name: "",
  username: "",
  email: "",
  phone_number: "",
  password: "",
};

interface EditClerkSheetProps {
  // The clerk being edited; null keeps the sheet closed.
  userId: string | null;
  onOpenChange: (open: boolean) => void;
}

export default function EditClerkSheet({
  userId,
  onOpenChange,
}: EditClerkSheetProps) {
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  // The roster row only carries username/email/phone, so the full account is
  // fetched for the first/last name.
  const { data, isLoading, isError } = useGetUser(userId ?? "");
  const user = data?.user;
  const updateUser = useUpdateUser(userId ?? "");

  const form = useForm<EditStaffUserFormInput, unknown, EditStaffUserFormData>(
    {
      resolver: zodResolver(editStaffUserSchema),
      defaultValues: EMPTY_VALUES,
      mode: "onChange",
    },
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = form;

  // Seeded once the account arrives, and again whenever another clerk is
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

  async function onSubmit(values: EditStaffUserFormData) {
    if (!userId || !user) return;

    // Only what actually changed goes out. The backend's uniqueness check
    // doesn't exclude the account being edited, so re-sending the clerk's own
    // unchanged email/username/phone comes back as "already registered".
    const changes: Partial<UserFormData> = {};
    if (values.first_name !== (user.first_name ?? ""))
      changes.first_name = values.first_name;
    if (values.last_name !== (user.last_name ?? ""))
      changes.last_name = values.last_name;
    if (values.email.toLowerCase() !== (user.email ?? "").toLowerCase())
      changes.email = values.email;
    // Blank means "leave as is", not "clear it": the backend requires a
    // username, and an empty phone would become a bare "+966".
    if (values.username && values.username !== user.username)
      changes.username = values.username;
    const phone = toOptionalE164SaudiPhone(values.phone_number);
    if (
      phone &&
      phone !== toOptionalE164SaudiPhone(user.phone_number ?? undefined)
    )
      changes.phone_number = phone;
    if (values.password) changes.password = values.password;

    if (!Object.keys(changes).length) {
      onOpenChange(false);
      return;
    }

    try {
      await updateUser.mutateAsync(
        changes,
        {
          onSuccess: () => {
            toast.success(t("warehouseBuildings.staff.edit.success"));
            // Roster rows and candidate labels show the name/email too.
            queryClient.invalidateQueries({
              queryKey: warehouseKeys.warehouseStaff(),
            });
            queryClient.invalidateQueries({
              queryKey: warehouseKeys.warehouseStaffCandidates(),
            });
            onOpenChange(false);
          },
          onError: (err) => {
            toast.error(
              err.message || t("warehouseBuildings.staff.edit.error"),
            );
            const field = CONFLICT_FIELDS.find(([pattern]) =>
              pattern.test(err.message),
            )?.[1];
            if (err instanceof ApiError && err.status === 409 && field) {
              form.setError(field, { message: err.message });
            }
          },
        },
      );
    } catch (err) {
      // onError above has already toasted.
      console.error("Update clerk failed:", err);
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
            {t("warehouseBuildings.staff.edit.title")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t("warehouseBuildings.staff.edit.description")}
          </SheetDescription>
        </SheetHeader>

        {isError ? (
          <p className="mt-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
            {t("warehouseBuildings.staff.edit.loadError")}
          </p>
        ) : isLoading || !user ? (
          <div className="mt-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("forms.sections.accountDetails")}
                </h3>

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

              </div>

              <div className="space-y-4 border-t pt-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("warehouseBuildings.staff.edit.passwordSection")}
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
                        {t("warehouseBuildings.staff.edit.passwordHint")}
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
                  {isSubmitting
                    ? t("warehouseBuildings.actions.saving")
                    : t("forms.actions.save")}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
