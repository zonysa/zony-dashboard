import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "@/lib/hooks/useTranslation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/lib/hooks/useAuth";
import { LoginFormData, loginSchema } from "@/lib/schema/auth.schema";
import Link from "next/link";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t, isRTL } = useTranslation();

  const [showPassword, setShowPassword] = useState(false);

  // Use our mock-enabled hook
  const loginMutation = useLogin();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember_me: true,
    },
  });

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
      remember_me: data.remember_me ?? true,
    });
  };

  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.login.formTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                // className="flex flex-col gap-6"
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-3">
                    <FormLabel htmlFor="email" className="font-normal">
                      {t("auth.login.emailLable")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder={t("auth.login.emailPlaceholder")}
                        disabled={loginMutation.isPending}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="grid">
                    <FormLabel htmlFor="password" className="font-normal">
                      {t("auth.login.passwordLabel")}
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder={t("auth.login.passwordPlaceholder")}
                          disabled={loginMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute ${
                            isRTL ? "left" : "right"
                          }-0 top-0 h-full px-3 py-2 hover:bg-transparent`}
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={loginMutation.isPending}
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

              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="remember_me"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value ?? false}
                          onCheckedChange={field.onChange}
                          disabled={loginMutation.isPending}
                        />
                      </FormControl>
                      <Label className="text-gray-400 font-normal cursor-pointer">
                        {t("auth.login.rememberMe")}
                      </Label>
                    </FormItem>
                  )}
                />

                <Link
                  href="/auth/request-password"
                  className="text-sm underline-offset-4 hover:underline text-primary"
                >
                  {t("auth.login.forgotPassword")}
                </Link>
              </div>

              <Button
                disabled={loginMutation.isPending}
                type="submit"
                className="w-full mt-6 py-3.5"
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  t("auth.login.CTA")
                )}
              </Button>

              {/* Display error if any */}
              {loginMutation.error && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-md">
                  {loginMutation.error.message}
                </div>
              )}

              {/* Remember Me and Forgot Password */}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
