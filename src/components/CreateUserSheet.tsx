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
import { toast } from "sonner";
import { RegisterFormData, registerSchema } from "@/lib/schema/auth.schema";
import { useRegister } from "@/lib/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface CreateUserSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  userRole?: number;
}

const CreateUserSheet = ({
  open,
  onOpenChange,
  userRole,
}: CreateUserSheetProps) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: userRole,
      phoneNumber: "",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const createUserMutation = useRegister();

  async function onSubmit(data: RegisterFormData) {
    try {
      console.log("Form submitted:", data);
      await createUserMutation.mutateAsync(
        {
          first_name: data.firstName,
          last_name: data.lastName,
          username: data.username,
          role_id: data.roleId,
          email: data.email,
          password: data.password,
          phone_number: data.phoneNumber,
        },
        {
          onSuccess: () => {
            toast.success(t("dialogs.createUser.success").replace("{username}", data.username));
            form.reset();
            // Invalidate users query to refetch the list
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Close the sheet
            if (onOpenChange) {
              onOpenChange(false);
            }
          },
          onError: (err) => {
            toast.error(t("dialogs.createUser.error").replace("{error}", err.message));
          },
        }
      );
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t("dialogs.createUser.unexpectedError"));
    }
  }

  const userMap = [
    "representative",
    "responsible",
    "supervisor",
    "customer_service",
    "courier",
    "customer",
  ];

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
                      <Input placeholder={t("forms.placeholders.enterFirstName")} {...field} />
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
                      <Input placeholder={t("forms.placeholders.enterLastName")} {...field} />
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
                      <Input placeholder={t("forms.placeholders.enterUsername")} {...field} />
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
                      <Input
                        type="tel"
                        placeholder={t("forms.placeholders.enterPhoneNumber")}
                        {...field}
                      />
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
                      disabled={!!userRole}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("forms.placeholders.selectRole")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {userRole ? (
                          userMap.map((role, index) => {
                            const roleId = index + 2;
                            return (
                              <SelectItem
                                key={roleId}
                                value={roleId.toString()}
                              >
                                {t(`forms.roles.${role.replace(/_/g, "")}`)}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <>
                            <SelectItem value="2">{t("forms.roles.representative")}</SelectItem>
                            <SelectItem value="3">{t("forms.roles.responsible")}</SelectItem>
                            <SelectItem value="4">{t("forms.roles.supervisor")}</SelectItem>
                            <SelectItem value="5">{t("forms.roles.customerService")}</SelectItem>
                            <SelectItem value="6">{t("forms.roles.courier")}</SelectItem>
                            <SelectItem value="7">{t("forms.roles.customer")}</SelectItem>
                          </>
                        )}
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
                {isSubmitting ? t("forms.actions.creating") : t("forms.actions.submit")}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default CreateUserSheet;
