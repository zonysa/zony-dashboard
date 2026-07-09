"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form, FormControl, FormItem, FormLabel } from "@/components/ui/form";
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
import { PartyPersonalSection } from "@/forms/parcel/PartyPersonalSection";
import { ParcelContentSection } from "@/forms/parcel/ParcelContentSection";
import { toE164SaudiPhone } from "@/lib/validators/phone";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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
      pickup_period: 2,
      // Customers are always the sender — the backend snapshots their
      // personal profile server-side, but still needs the sender's
      // location, which is collected below regardless of role.
      sender: {
        personal: { name: "", phone_number: "", email: "" },
        location: { address: "" },
      },
      receiver: { personal: { name: "", phone_number: "", email: "" }, location: { address: "" } },
      content: { description: "", quantity: 1 },
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  // Customers are the sender — prefill name/phone/email from the logged-in
  // profile once available; the fields stay editable.
  useEffect(() => {
    if (!isCustomer || !user) return;
    setValue(
      "sender.personal.name",
      `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.username,
    );
    setValue("sender.personal.phone_number", user.phone_number || "");
    setValue("sender.personal.email", user.email || "");
  }, [isCustomer, user, setValue]);

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
      const dimensions = data.content.dimensions;
      const hasDimensions =
        dimensions &&
        [dimensions.length, dimensions.width, dimensions.height].every(
          (v) => v !== undefined,
        );

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
        content: {
          ...data.content,
          dimensions: hasDimensions ? dimensions : undefined,
        },
      };

      await parcelMutation.mutateAsync(payload, {
        onSuccess: () => {
          toast.success(t("dialogs.createParcel.success"));
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
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                {t("dialogs.createParcel.title")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {t("dialogs.createParcel.description")}
              </p>
            </div>
            <div className="flex gap-2">
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
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>{t("forms.sections.sender")}</CardTitle>
                  <CardDescription>
                    {t("forms.sections.senderLocationDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                  {!isCustomer && (
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
                  )}

                  <PartySection form={form} prefix="sender" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4">
                  <CardTitle>{t("forms.sections.receiver")}</CardTitle>
                  <CardDescription>
                    {t("forms.sections.receiverLocationDescription")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4">
                  <PartySection form={form} prefix="receiver" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4">
                  <CardTitle>{t("forms.sections.parcelContent")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <ParcelContentSection form={form} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="px-4">
                  <CardTitle>{t("forms.sections.senderInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <PartyPersonalSection form={form} prefix="sender" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4">
                  <CardTitle>{t("forms.sections.receiverInfo")}</CardTitle>
                </CardHeader>
                <CardContent className="px-4">
                  <PartyPersonalSection form={form} prefix="receiver" />
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
