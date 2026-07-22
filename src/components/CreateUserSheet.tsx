"use client";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetClose,
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
import { RegisterFormData, registerSchema } from "@/lib/schema/auth.schema";
import { toE164SaudiPhone } from "@/lib/validators/phone";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useEffect } from "react";
import { useCreateUser } from "@/lib/hooks/useUsers";
import { useRoles, getRoleId } from "@/lib/hooks/useRoles";

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
  const { t } = useTranslation();
  const { data: rolesData } = useRoles();
  const roles = rolesData?.roles;
  const selectableRoles = roles?.filter((role) => role.name !== "admin") ?? [];

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
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

  async function onSubmit(data: RegisterFormData) {
    try {
      await createUserMutation.mutateAsync(
        {
          first_name: data.firstName,
          last_name: data.lastName,
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
      <SheetContent className="sm:max-w-[625px] overflow-y-auto px-6">
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
                name="firstName"
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
                name="lastName"
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
                      <Input
                        type="password"
                        placeholder={t("forms.placeholders.enterPassword")}
                        {...field}
                      />
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
            <SheetFooter className="w-full gap-2 pt-6 border-t px-0">
              <SheetClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>
                  {t("forms.actions.cancel")}
                </Button>
              </SheetClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("forms.actions.creating")
                  : t("forms.actions.submit")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateUserSheet;
