import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "../ui/checkbox";

export function LoginForm({
  className,
  onPress,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex w-full flex-col gap-6 z-2", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Enter your personal information</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email" className="font-normal">
                  Email or phone number
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter Your Email Or Phone Number"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password" className="font-normal">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Enter Password"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-3">
                <Checkbox id="rememberme" />
                <Label
                  htmlFor="rememberme"
                  className="text-gray-400 font-normal"
                >
                  Remember me
                </Label>
              </div>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline text-primary"
              >
                Forgot your password?
              </a>
            </div>
            <Button
              onClick={onPress}
              type="submit"
              className="w-full mt-6 py-3.5"
            >
              Confirm
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
