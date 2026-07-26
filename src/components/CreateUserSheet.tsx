"use client";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "./ui/input";
import { PhoneInput } from "./ui/phone-input";
import { toast } from "sonner";
import { CreateUserFormData, createUserSchema } from "@/lib/schema/auth.schema";
import { toE164SaudiPhone } from "@/lib/validators/phone";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useEffect, useState } from "react";
import { useCreateUser } from "@/lib/hooks/useUsers";
import { useRoles, getRoleId } from "@/lib/hooks/useRoles";
import { Eye, EyeOff, RefreshCw, Copy } from "lucide-react";

const PASSWORD_CHARSET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

function generateSecurePassword(length = 12) {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(
    randomValues,
    (value) => PASSWORD_CHARSET[value % PASSWORD_CHARSET.length]
  ).join("");
}

// Maps a role's DB name to its translation key under forms.roles.* — the
// naming isn't 1:1 (snake_case in the DB vs camelCase in translations).
const ROLE_TRANSLATION_KEYS: Record<string, string> = {
  representative: "forms.roles.representative",
  responsible: "forms.roles.responsible",
  supervisor: "forms.roles.supervisor",
  customer_service: "forms.roles.customerService",
  courier: "forms.roles.courier",
  customer: "forms.roles.customer",
};

interface CreateUserSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // Role name (e.g. "courier", "responsible") to lock the form to. Role ids
  // are resolved dynamically via useRoles() since they aren't stable across
  // environments.
  userRoleName?: string;
}

const CreateUserSheet = ({
  open,
  onOpenChange,
  userRoleName,
}: CreateUserSheetProps) => {
  const queryClient = useQueryClient();
  const { t, isRTL } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const { data: rolesData } = useRoles();
  const roles = rolesData?.roles;
  const selectableRoles = roles?.filter((role) => role.name !== "admin") ?? [];

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
      phoneNumber: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (userRoleName) {
      const roleId = getRoleId(roles, userRoleName);
      if (roleId) {
        form.setValue("roleId", roleId);
      }
    }
  }, [userRoleName, roles, form]);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const createUserMutation = useCreateUser();

  function handleGeneratePassword() {
    const generated = generateSecurePassword();
    form.setValue("password", generated, {
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

  async function onSubmit(data: CreateUserFormData) {
    const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
    const lastName = rest.join(" ");

    try {
      await createUserMutation.mutateAsync(
        {
          first_name: firstName,
          last_name: lastName,
          username: data.username,
          role_id: data.roleId,
          email: data.email,
          password: data.password,
          phone_number: toE164SaudiPhone(data.phoneNumber),
        },
        {
          onSuccess: () => {
            toast.success(
              t("dialogs.createUser.success").replace(
                "{username}",
                data.username
              )
            );
            form.reset();
            // Invalidate users query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Invalidate available responsibles and representatives
            queryClient.invalidateQueries({ queryKey: ["available-responsibles"] });
            queryClient.invalidateQueries({ queryKey: ["available-representatives"] });
            // Close the sheet
            if (onOpenChange) {
              onOpenChange(false);
            }
          },
          onError: (err) => {
            toast.error(
              t("dialogs.createUser.error").replace("{error}", err.message)
            );
          },
        }
      );
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t("dialogs.createUser.unexpectedError"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRTL ? "left" : "right"}
        className="sm:max-w-[625px] overflow-y-auto px-6"
      >
        <SheetHeader className="px-0">
          <SheetTitle className="text-xl font-semibold">
            {t("dialogs.createUser.title")}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t("dialogs.createUser.description")}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
            {/* Account Details Section */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-foreground">
                {t("forms.sections.accountDetails")}
              </h3>
              <FormField
                control={control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.fullName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("forms.placeholders.enterFullName")}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.username")}</FormLabel>
                    <FormControl>
                      <Input
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
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.password")}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder={t("forms.placeholders.enterPassword")}
                          className={isRTL ? "pl-28" : "pr-28"}
                          {...field}
                        />
                        <div
                          className={`absolute ${
                            isRTL ? "left-0" : "right-0"
                          } top-0 flex h-full items-center`}
                        >
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
                            onClick={() => setShowPassword(!showPassword)}
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Personal Information Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-base font-semibold text-foreground">
                {t("forms.sections.personalInformation")}
              </h3>

              <FormField
                control={control}
                name="phoneNumber"
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

              <FormField
                control={control}
                name="roleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.role")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                      disabled={!!userRoleName}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("forms.placeholders.selectRole")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectableRoles.map((role) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {t(
                              (ROLE_TRANSLATION_KEYS[role.name] ??
                                role.name) as never
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer Actions */}
            <SheetFooter className="w-full pt-6 border-t px-0">
              <Button
                type="submit"
                className="w-full py-6"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("forms.actions.creating")
                  : t("forms.actions.create")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateUserSheet;
