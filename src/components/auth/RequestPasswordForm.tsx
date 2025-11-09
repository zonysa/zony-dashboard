import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useRequestPassword } from "@/lib/hooks/useAuth";
import {
  RequestPasswordFormData,
  RequestPasswordResponse,
  requestPasswordSchema,
} from "@/lib/schema/auth.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { toast } from "sonner";

export function RequestPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const { t } = useTranslation();

  // Use our mock-enabled hook
  const forgetPasswordMutation = useRequestPassword();

  const form = useForm<RequestPasswordFormData>({
    resolver: zodResolver(requestPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Watch the email field from the actual form instance
  const emailValue = form.watch("email");

  const onSubmit = (data: RequestPasswordFormData) => {
    forgetPasswordMutation.mutate(data, {
      onSuccess: () => {
        toast(t("auth.message.passwordResetSend"), {
          action: t("auth.action.undo"),
        });
        router.replace("/auth/reset-password");
      },
      onError: (error: Error) => {
        console.error(t("auth.message.passwordResetFailed"), error);
        toast(error.message || t("auth.message.passwordResetSend"), {
          action: t("auth.action.undo"),
        });
      },
    });
  };

  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>{t("auth.requestPassword.formTitle")}</CardTitle>
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
                      {t("auth.requestPassword.email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder={t("auth.requestPassword.placeholder")}
                        disabled={forgetPasswordMutation.isPending}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <Button
                  disabled={!emailValue || forgetPasswordMutation.isPending}
                  type="submit"
                  className="w-full mt-6 py-3.5"
                >
                  {forgetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("forms.actions.confirming")}
                    </>
                  ) : (
                    t("forms.actions.submit")
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => router.push("/auth/login")}
                  className="text-sm text-gray-600 bg-gray-100 hover:text-gray-800 w-full"
                >
                  {t("auth.action.backToLogin")}
                </Button>
              </div>

              {/* Display error if any */}
              {forgetPasswordMutation.error && (
                <div className="text-sm text-red-500 text-center p-3 bg-red-50 rounded-md">
                  {forgetPasswordMutation.error.message}
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
