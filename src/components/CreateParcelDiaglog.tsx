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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ParcelFormData } from "@/lib/schema/parcel.schema";
import { Input } from "./ui/input";
import { useGetClients } from "@/lib/hooks/useClient";
import { Client } from "@/lib/schema/client.schema";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { useCreateParcel } from "@/lib/hooks/useParcel";
import { toast } from "sonner";
import { BranchDetails } from "@/lib/schema/branch.schema";

const CreateParcelSheet = () => {
  const { data: clients } = useGetClients();
  const { data: branches } = useGetBranches();

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ParcelFormData>({
    defaultValues: {
      customer_id: "3fa89b70-e87c-44de-b1e9-f027f9e67679",
      barcode: "ABC-abc-1234",
      tracking_number: "2131231312",
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;
  const parcelMutation = useCreateParcel();

  async function onSubmit(data: ParcelFormData) {
    try {
      console.log("Form submitted:", data);
      await parcelMutation.mutateAsync(
        {
          tracking_number: data.tracking_number,
          barcode: data.barcode,
          pickup_period: 2,
          client_id: Number(data.client_id),
          customer_id: data.customer_id,
        },
        {
          onSuccess: () => {
            toast.success(
              `Parcel created successfully with tracking number ${data.tracking_number}`
            );
            form.reset();
            setDialogOpen(false);
          },
          onError: (err) => {
            toast.error(`Failed to create parcel: ${err.message}`);
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
        variant="default"
      >
        Create New Parcel
      </Button>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="sm:max-w-[625px] overflow-y-auto px-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-xl font-semibold">
              Create New Parcel
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              Fill in the parcel details below to create a new delivery order.
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Parcel Details Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  Parcel Details
                </h3>

                <FormField
                  control={control}
                  name="tracking_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tracking number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Barcode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parcel barcode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="customer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assignment Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-base font-semibold text-foreground">
                  Assignment
                </h3>

                <FormField
                  control={control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.clients?.map((client: Client) => (
                            <SelectItem
                              key={client.id}
                              value={client.id.toString()}
                            >
                              {client.name}
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
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Parcel"}
                </Button>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </SheetClose>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CreateParcelSheet;
