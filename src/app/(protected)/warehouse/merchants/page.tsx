"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetCities } from "@/lib/hooks/useCity";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetMerchants, useSaveMerchant } from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  MerchantFormData,
  merchantFormSchema,
  WHMerchant,
} from "@/lib/schema/warehouse.schema";
import { normalizeSaudiPhone } from "@/lib/validators/phone";

function addressLine(a: WHMerchant["return_address"]): string {
  if (!a) return "—";
  return [a.line1, a.district, a.city].filter(Boolean).join(", ") || "—";
}

export default function MerchantsPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetMerchants();
  const { data: citiesData } = useGetCities();
  // `null` = closed, `"new"` = create, otherwise the merchant being edited.
  const [editing, setEditing] = useState<WHMerchant | "new" | null>(null);

  const merchants = data?.merchants ?? [];
  const cityName = (id: number | null) =>
    id == null
      ? "—"
      : ((citiesData?.cities ?? []).find((c) => c.id === id)?.name ?? `#${id}`);

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseMerchants.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseMerchants.subtitle")}
          </p>
        </div>
        <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            {t("warehouseMerchants.actions.create")}
          </Button>
        </Can>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseMerchants.loadError")}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !merchants.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Store className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("warehouseMerchants.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseMerchants.table.name")}</TableHead>
                  <TableHead>{t("warehouseMerchants.table.contact")}</TableHead>
                  <TableHead>{t("warehouseMerchants.table.phone")}</TableHead>
                  <TableHead>{t("warehouseMerchants.table.city")}</TableHead>
                  <TableHead>
                    {t("warehouseMerchants.table.returnAddress")}
                  </TableHead>
                  <TableHead>{t("warehouseMerchants.table.status")}</TableHead>
                  <TableHead className="text-end">
                    {t("warehouseMerchants.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {merchants.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell>{m.contact_name ?? "—"}</TableCell>
                    <TableCell dir="ltr" className="text-start">
                      {m.phone_number ?? "—"}
                    </TableCell>
                    <TableCell>{cityName(m.city_id)}</TableCell>
                    <TableCell className="max-w-56 truncate text-muted-foreground">
                      {addressLine(m.return_address)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.is_active ? "success" : "secondary"}>
                        {m.is_active
                          ? t("warehouseMerchants.active")
                          : t("warehouseMerchants.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(m)}
                        >
                          {t("warehouseMerchants.actions.edit")}
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {editing && (
        <MerchantDialog
          merchant={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PageContainer>
  );
}

function MerchantDialog({
  merchant,
  onClose,
}: {
  merchant: WHMerchant | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveMerchant();
  const { data: citiesData } = useGetCities();

  const form = useForm<MerchantFormData>({
    resolver: zodResolver(merchantFormSchema),
    defaultValues: {
      name: merchant?.name ?? "",
      contact_name: merchant?.contact_name ?? "",
      phone_number: normalizeSaudiPhone(merchant?.phone_number ?? ""),
      city_id: merchant?.city_id ?? undefined,
      return_line1: merchant?.return_address?.line1 ?? "",
      return_district: merchant?.return_address?.district ?? "",
      return_city: merchant?.return_address?.city ?? "",
      is_active: merchant?.is_active ?? true,
    },
  });
  const { control, handleSubmit } = form;

  async function onSubmit(v: MerchantFormData) {
    const hasAddress = v.return_line1 || v.return_district || v.return_city;
    try {
      await save.mutateAsync({
        id: merchant?.id,
        data: {
          name: v.name,
          contact_name: v.contact_name || null,
          phone_number: v.phone_number || null,
          city_id: v.city_id ?? null,
          return_address: hasAddress
            ? {
                line1: v.return_line1 || undefined,
                district: v.return_district || undefined,
                city: v.return_city || undefined,
              }
            : null,
          is_active: v.is_active,
        },
      });
      onClose();
    } catch (err) {
      // useSaveMerchant's onError already toasts the server message.
      console.error("Save merchant failed:", err);
    }
  }

  const text = (
    name:
      | "name"
      | "contact_name"
      | "phone_number"
      | "return_line1"
      | "return_district"
      | "return_city",
    label: string,
    ltr = false,
  ) => (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              value={field.value ?? ""}
              dir={ltr ? "ltr" : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {merchant
              ? t("warehouseMerchants.dialog.editTitle")
              : t("warehouseMerchants.dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("warehouseMerchants.dialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {text("name", t("warehouseMerchants.fields.name"))}
              {text("contact_name", t("warehouseMerchants.fields.contact"))}
              {text("phone_number", t("warehouseMerchants.fields.phone"), true)}
              <FormField
                control={control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseMerchants.fields.city")}</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "warehouseMerchants.fields.cityPlaceholder",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(citiesData?.cities ?? []).map((city) => (
                          <SelectItem key={city.id} value={String(city.id)}>
                            {city.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3 rounded-md border p-3">
              <p className="text-sm font-medium">
                {t("warehouseMerchants.fields.returnAddress")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("warehouseMerchants.fields.returnAddressHint")}
              </p>
              {text("return_line1", t("warehouseMerchants.fields.line1"))}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {text(
                  "return_district",
                  t("warehouseMerchants.fields.district"),
                )}
                {text(
                  "return_city",
                  t("warehouseMerchants.fields.addressCity"),
                )}
              </div>
            </div>

            <FormField
              control={control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">
                    {t("warehouseMerchants.fields.active")}
                  </FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseLoading.actions.cancel")}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending
                  ? t("warehouseMerchants.dialog.saving")
                  : t("warehouseMerchants.dialog.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
