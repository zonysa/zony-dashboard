"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetClients } from "@/lib/hooks/useClient";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useCreateParcel } from "@/lib/hooks/useParcel";
import { useUser } from "@/lib/stores/auth-store";
import { normalizeRole } from "@/lib/rbac/roles";
import { Client } from "@/lib/schema/client.schema";
import { CreateParcelFormData, createParcelSchema } from "@/lib/schema/parcel.schema";
import { PartySection } from "@/forms/parcel/PartySection";
import { toE164SaudiPhone } from "@/lib/validators/phone";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUser();
  const isCustomer = normalizeRole(user?.role || "") === "customer";
  const { data: clients } = useGetClients();
  const parcelMutation = useCreateParcel();

  const form = useForm<CreateParcelFormData>({
    resolver: zodResolver(createParcelSchema),
    defaultValues: {
      barcode: "",
      tracking_number: "",
      pickup_period: 2,
      // Customers are always the sender — the backend snapshots their
      // profile server-side, so no sender block is collected here.
      ...(isCustomer
        ? {}
        : {
            sender: {
              personal: { name: "", phone_number: "", email: "" },
              location: { address: "" },
            },
          }),
      receiver: { personal: { name: "", phone_number: "", email: "" }, location: { address: "" } },
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  function handleClientSelect(clientId: string) {
    const client = clients?.clients?.find((c: Client) => String(c.id) === clientId);
    setValue("client_id", Number(clientId));
    if (client) {
      setValue("sender.personal.name", client.name);
      setValue("sender.personal.phone_number", client.phone_number);
      setValue("sender.personal.email", client.email);
    }
  }

  async function onSubmit(data: CreateParcelFormData) {
    try {
      const payload = {
        ...data,
        sender: data.sender
          ? {
              ...data.sender,
              personal: {
                ...data.sender.personal,
                phone_number: toE164SaudiPhone(data.sender.personal.phone_number),
                email: data.sender.personal.email || undefined,
              },
            }
          : undefined,
        receiver: {
          ...data.receiver,
          personal: {
            ...data.receiver.personal,
            phone_number: toE164SaudiPhone(data.receiver.personal.phone_number),
            email: data.receiver.personal.email || undefined,
          },
        },
      };

      await parcelMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success(
            t("dialogs.createParcel.success").replace(
              "{trackingNumber}",
              data.tracking_number,
            ),
          );
          router.push("/parcels");
        },
        onError: (err) => {
          toast.error(
            t("dialogs.createParcel.error").replace("{error}", err.message),
          );
        },
      });
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(t("dialogs.createUser.unexpectedError"));
    }
  }

  return (
    <div className="w-full px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">
          {t("dialogs.createParcel.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("dialogs.createParcel.description")}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("forms.sections.parcelDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={control}
                name="tracking_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.trackingNumber")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("forms.placeholders.enterTrackingNumber")}
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
                name="pickup_period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("forms.fields.pickupPeriod")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("forms.sections.sender")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isCustomer ? (
                <div className="text-sm text-muted-foreground">
                  {t("forms.fields.name")}:{" "}
                  <span className="text-foreground font-medium">
                    {`${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
                      user?.username}
                  </span>
                  {" · "}
                  {t("forms.fields.phoneNumber")}:{" "}
                  <span className="text-foreground font-medium">
                    {user?.phone_number}
                  </span>
                </div>
              ) : (
                <>
                  <FormItem>
                    <FormLabel>{t("table.client")}</FormLabel>
                    <Select onValueChange={handleClientSelect}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t("forms.placeholders.selectClient")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.clients?.map((client: Client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>

                  <PartySection form={form} prefix="sender" />
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("forms.sections.receiver")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <PartySection form={form} prefix="receiver" />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => router.push("/parcels")}
            >
              {t("forms.actions.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("forms.actions.save") + "..."
                : t("forms.actions.save")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
