"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { StepComponentProps } from "@/hooks/useMutliStepForm";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  CustomerServiceProps,
  CustomerServiceFormData,
  formSchema,
} from "@/lib/schema/customer-services.schema";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FileInput } from "@/components/ui/file-input";

const Page: React.FC<StepComponentProps<CustomerServiceProps>> = () => {
  const form = useForm<CustomerServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uploadPhoto: null,
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
    mode: "onChange",
  });

  const { control } = form;

  function onSubmit(values: CustomerServiceFormData) {
    console.log(values);
  }

  return (
    <Card className="w-full max-w-2xl mx-auto px-4 mt-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={control}
            name="uploadPhoto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Commercial Registration</FormLabel>
                <FormControl>
                  <FileInput
                    value={field.value}
                    onChange={field.onChange}
                    accept="image/*, application/pdf"
                  />
                </FormControl>
                <FormDescription>
                  Upload your commercial registration document (PDF or image)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Customer Service 1" {...field} />
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
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="01069144823" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ego.egyptian@pound.com"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={control}
              name="repeatPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repeat Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Repeat password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline">Cancel</Button>
        <Button type="submit">Save changes</Button>
      </div>
    </Card>
  );
};

export default Page;
