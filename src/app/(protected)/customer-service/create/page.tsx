"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CustomerServiceFormData } from "@/lib/schema/customer-service.schema";
import { Input } from "@/components/ui/input";
import { FileInput } from "@/components/ui/file-input";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRegister } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

const Page: React.FC = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();
  const customerServiceMutation = useRegister();
  const { t, isRTL } = useTranslation();

  const form = useForm<CustomerServiceFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      username: "",
      password: "",
    },
  });

  const { control } = form;

  async function onSubmit() {
    try {
      const data = form.getValues();
      await customerServiceMutation.mutateAsync(
        {
          first_name: data.firstName,
          last_name: data.lastName,
          phone_number: data.phoneNumber,
          email: data.email,
          password: data.password,
          username: data.username,
          role_id: 5,
        },
        {
          onSuccess: () => {
            toast.success(
              `Customer Service ${data.firstName} ${data.lastName} created successfuly`
            );
            form.reset();
            router.push("/customer-service");
          },
          onError: (error) => {
            toast.error(`Error ${error.message}`);
          },
        }
      );

      form.reset();
    } catch (error) {
      toast.error("Error", {
        description: `${error}`,
      });
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 mt-10 space-y-8">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>{t("forms.sections.customerServiceTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Customer Service Photo */}
              <FormField
                control={control}
                name="photo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.photo")}</FormLabel>
                    <FormControl>
                      <FileInput
                        value={field.value}
                        onChange={field.onChange}
                        accept="image/*, application/pdf"
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("forms.fields.firstName")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("forms.placeholders.enterFirstName")}
                            autoComplete="firstName"
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
                            {...field}
                            placeholder={t("forms.placeholders.enterLastName")}
                            autoComplete="lastName"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("forms.fields.email")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder={t("forms.placeholders.enterEmail")}
                            autoComplete="email"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("forms.fields.phoneNumber")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder={t(
                              "forms.placeholders.enterPhoneNumber"
                            )}
                            autoComplete="tel"
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("forms.fields.username")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("forms.placeholders.enterUsername")}
                            autoComplete="given-name"
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
                        <FormLabel htmlFor="password" className="font-normal">
                          {t("forms.fields.password")}
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder={t(
                                "forms.placeholders.enterPassword"
                              )}
                              // disabled={loginMutation.isPending}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className={`absolute ${
                                isRTL ? "left-0" : "right-0"
                              } top-0 h-full px-3 py-2 hover:bg-transparent`}
                              onClick={() => setShowPassword(!showPassword)}
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
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="submit">{t("forms.actions.submit")}</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Page;
