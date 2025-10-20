"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

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
import { Plus } from "lucide-react";
import { RegisterFormData, registerSchema } from "@/lib/schema/auth.schema";
import { useRegister } from "@/lib/hooks/useAuth";

const CreateUserSheet = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      roleId: undefined,
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
            toast.success(`User "${data.username}" created successfully`);
            form.reset();
            setDialogOpen(false);
          },
          onError: (err) => {
            toast.error(`Failed to create user: ${err.message}`);
          },
        }
      );
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("An unexpected error occurred");
    }
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        type="button"
        variant="outline"
        size="icon"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="sm:max-w-[625px] overflow-y-auto px-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-xl font-semibold">
              Create New User
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Fill in the user details below to create a new account.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Account Details Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Account Details
                </h3>
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter First Name" {...field} />
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
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter Last Name" {...field} />
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
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter username" {...field} />
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter email address"
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
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter password"
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
                  Personal Information
                </h3>

                <FormField
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="Enter phone number"
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
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2">Representative</SelectItem>
                          <SelectItem value="3">Responsible</SelectItem>
                          <SelectItem value="4">Supervisor</SelectItem>
                          <SelectItem value="5">Customer Service</SelectItem>
                          <SelectItem value="6">Courier</SelectItem>
                          <SelectItem value="7">Customer</SelectItem>
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
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </SheetClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CreateUserSheet;
