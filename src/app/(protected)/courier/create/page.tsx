"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

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
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileInput } from "@/components/ui/file-input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CustomerServiceFormData,
  formSchema,
} from "@/lib/schema/couriers.schema";

const Page: React.FC<StepComponentProps<unknown>> = () => {
  const [availableZones] = React.useState([
    "Maadi",
    "Helwan",
    "Nasr City",
    "Zamalek",
    "Downtown",
    "New Cairo",
  ]);

  const form = useForm<CustomerServiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      uploadPhoto: null,
      name: "",
      phoneNumber: "",
      email: "",
      password: "",
      repeatPassword: "",
      fullName: "",
      idNumber: "",
      city: "",
      assignedZones: [],
    },
    mode: "onChange",
  });

  const { control, watch, setValue } = form;
  const assignedZones = watch("assignedZones");

  function onSubmit(values: CustomerServiceFormData) {
    console.log(values);
  }

  const addZone = (zone: string) => {
    if (!assignedZones.includes(zone)) {
      setValue("assignedZones", [...assignedZones, zone]);
    }
  };

  const removeZone = (zone: string) => {
    setValue(
      "assignedZones",
      assignedZones.filter((z) => z !== zone)
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-10 space-y-8">
      {/* Basic Information Section */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Service Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={control}
                name="uploadPhoto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Photo</FormLabel>
                    <FormControl>
                      <FileInput
                        value={field.value}
                        onChange={field.onChange}
                        accept="image/*"
                      />
                    </FormControl>
                    <FormDescription>
                      Upload profile photo (image files only)
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
                        <div className="flex">
                          <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-l-md">
                            +20
                          </span>
                          <Input
                            placeholder="Enter Phone Number"
                            className="rounded-l-none"
                            {...field}
                          />
                        </div>
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
                        <div className="relative">
                          <Input
                            type="password"
                            placeholder="Enter Password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                          >
                            👁️
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Personal Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <FormField
              control={control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="idNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="29166489155" {...field} />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">A</span>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Assignment Section */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <FormField
              control={control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Cairo" {...field} />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">A</span>
                        </div>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Assigned Zone</FormLabel>
              <div className="mt-2">
                <Select onValueChange={addZone}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select zones to assign" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableZones
                      .filter((zone) => !assignedZones.includes(zone))
                      .map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {assignedZones.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {assignedZones.map((zone) => (
                    <Badge
                      key={zone}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      {zone}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 hover:bg-transparent"
                        onClick={() => removeZone(zone)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pb-8">
        <Button variant="outline">Cancel</Button>
        <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
          Save changes
        </Button>
      </div>
    </div>
  );
};

export default Page;
