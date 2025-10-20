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
import { useForgotPassword } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();

  // Use our mock-enabled hook
  const forgetPasswordMutation = useForgotPassword();

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "test@example.com", // Pre-fill for testing
    },
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgetPasswordMutation.mutate(data, {
      onSuccess: () => {
        router.replace("/auth/verify-otp");
      },
    });
  };

  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forget Password Link will be sent to your Email</CardTitle>
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
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id="email"
                        type="email"
                        placeholder="Enter Your Email Or Phone Number"
                        disabled={forgetPasswordMutation.isPending}
                        required
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                disabled={isDirty || forgetPasswordMutation.isPending}
                type="submit"
                className="w-full mt-6 py-3.5"
              >
                {forgetPasswordMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming ...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>

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
