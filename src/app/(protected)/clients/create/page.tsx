"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { PageContainer } from "@/components/PageContainer";
import { useCreateClient } from "@/lib/hooks/useClient";
import { useUpdateLead } from "@/lib/hooks/useLead";
import { clientFormSchema, ClientFormData } from "@/lib/schema/client.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function CreateClientPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get("leadId");

  const clientMutation = useCreateClient();
  const updateLead = useUpdateLead();

  const form = useForm<
    z.input<typeof clientFormSchema>,
    unknown,
    ClientFormData
  >({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      phone_number: searchParams.get("phone_number") || "",
      contact_person: searchParams.get("contact_person") || "",
      type: "Other",
      status: "active",
      currency: "USD",
      payout_per_parcel: 0,
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ClientFormData) => {
    try {
      const result = (await clientMutation.mutateAsync(data)) as {
        client: { id: number };
      };

      if (leadId && result?.client?.id) {
        await updateLead.mutateAsync({
          id: leadId,
          data: { converted_client_id: result.client.id },
        });
      }

      router.push(`/clients/${result.client.id}`);
    } catch {
      // useCreateClient's onError already shows the error toast
    }
  };

  return (
    <PageContainer size="md" className="px-6 py-10">
      <h1 className="text-xl font-semibold mb-6">
        {t("clients.create", { defaultValue: "New Client" })}
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("table.name")}</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contact_person"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("leads.contactPerson", { defaultValue: "Contact person" })}
                </FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("table.email", { defaultValue: "Email" })}</FormLabel>
                <FormControl>
                  <Input {...field} type="email" required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("leads.phone")}</FormLabel>
                <FormControl>
                  <Input {...field} required />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("table.type")}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("table.currency", { defaultValue: "Currency" })}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="EGP">EGP</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payout_per_parcel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("partners.payoutPerParcel", {
                    defaultValue: "Payout per parcel",
                  })}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    name={field.name}
                    ref={field.ref}
                    value={field.value ?? 0}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={clientMutation.isPending}>
            {clientMutation.isPending && <Spinner />}
            {t("forms.actions.save", { defaultValue: "Save" })}
          </Button>
        </form>
      </Form>
    </PageContainer>
  );
}
