"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

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
import { useCreateParcel } from "@/lib/hooks/useParcel";
import { toast } from "sonner";

const CreateParcelSheet = () => {
  const { t } = useTranslation();
  const { data: clients } = useGetClients();

  const [dialogOpen, setDialogOpen] = useState(false);

  const form = useForm<ParcelFormData>({
    defaultValues: {
      customer_id: "",
      barcode: "",
      tracking_number: "",
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
              t("dialogs.createParcel.success").replace(
                "{trackingNumber}",
                data.tracking_number
              )
            );
            form.reset();
            setDialogOpen(false);
          },
          onError: (err) => {
            toast.error(
              t("dialogs.createParcel.error").replace("{error}", err.message)
            );
          },
        }
      );
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t("dialogs.createUser.unexpectedError"));
    }
  }

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        type="button"
        variant="default"
      >
        {t("dialogs.createParcel.title")}
      </Button>

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="sm:max-w-[625px] overflow-y-auto px-6">
          <SheetHeader className="px-0">
            <SheetTitle className="text-xl font-semibold">
              {t("dialogs.createParcel.title")}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {t("dialogs.createParcel.description")}
            </SheetDescription>
          </SheetHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-6">
              {/* Parcel Details Section */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("forms.sections.parcelDetails")}
                </h3>

                <FormField
                  control={control}
                  name="tracking_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("forms.fields.trackingNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "forms.placeholders.enterTrackingNumber"
                          )}
                          {...field}
                        />
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
                      <FormLabel>{t("forms.fields.barcode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("forms.placeholders.enterBarcode")}
                          {...field}
                        />
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
                      <FormLabel>{t("forms.fields.customerId")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("forms.placeholders.enterCustomerId")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Assignment Section */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-base font-semibold text-foreground">
                  {t("dialogs.createParcel.assignment")}
                </h3>

                <FormField
                  control={control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("table.client")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={t("forms.placeholders.selectClient")}
                            />
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
                  {isSubmitting
                    ? t("forms.actions.save") + "..."
                    : t("forms.actions.save")}
                </Button>
                <SheetClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSubmitting}
                  >
                    {t("forms.actions.cancel")}
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
