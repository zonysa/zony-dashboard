"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { usePudoNames } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetZones, usePreRegisterParcel } from "@/lib/hooks/useWarehouse";
import {
  PreRegisterData,
  preRegisterSchema,
} from "@/lib/schema/warehouse.schema";
import { toE164SaudiPhone } from "@/lib/validators/phone";

// "none" stands in for "no value" in the optional shop select: Radix Select
// cannot hold an empty-string value.
const NONE = "none";

/**
 * Create parcel → "Via warehouse (UCC)".
 *
 * Books a warehouse parcel before the merchant drops the box off. Nothing is
 * texted and no delivery code exists yet: the parcel waits as `not_received`
 * until a clerk scans its barcode at Receiving, which takes it in with the
 * details entered here already filled in.
 */
export function WarehouseParcelForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const { warehouseId } = useResolvedWarehouseId();
  const { data: zonesData } = useGetZones(warehouseId);
  const zones = zonesData?.zones ?? [];
  // `GET /pudos` refuses warehouse_clerk; without the list the shop picker is
  // hidden and the parcel defaults to home delivery.
  const { canList: canListPudos, branches } = usePudoNames();
  const preRegister = usePreRegisterParcel();

  // Dev-only convenience, same as the normal create form.
  const isDev = process.env.NODE_ENV === "development";

  const form = useForm<PreRegisterData>({
    resolver: zodResolver(preRegisterSchema),
    defaultValues: {
      warehouse_id: warehouseId ?? 0,
      barcode: "",
      tracking_ref: "",
      recipient_name: isDev ? "Test Receiver" : "",
      recipient_phone: isDev ? "0559876543" : "",
      address: {
        line1: isDev ? "Olaya Street, Building 5" : "",
        district: "",
        city: isDev ? "Riyadh" : "",
        notes: "",
      },
      zone_id: undefined,
      destination_pudo_id: undefined,
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    setValue,
    resetField,
    formState: { isSubmitting },
  } = form;

  // The warehouse follows the picker. Zones belong to one building, so a zone
  // picked for the previous warehouse is cleared rather than sent to the new
  // one, where it would not exist.
  useEffect(() => {
    if (!warehouseId) return;
    setValue("warehouse_id", warehouseId, { shouldValidate: true });
    resetField("zone_id");
  }, [warehouseId, setValue, resetField]);

  async function onSubmit(data: PreRegisterData) {
    const payload: PreRegisterData = {
      ...data,
      // Blank = let the server generate one; never send an empty string.
      barcode: data.barcode?.trim() || undefined,
      tracking_ref: data.tracking_ref?.trim() || undefined,
      recipient_phone: toE164SaudiPhone(data.recipient_phone),
    };

    try {
      const res = await preRegister.mutateAsync(payload);
      toast.success(
        res.barcode_generated
          ? t("dialogs.createParcel.warehouse.successGenerated", {
              barcode: res.parcel.barcode,
            })
          : t("dialogs.createParcel.warehouse.success"),
      );
      router.push(`/warehouse/parcels/${res.parcel.id}`);
    } catch (err) {
      toast.error(
        t("dialogs.createParcel.error").replace(
          "{error}",
          err instanceof Error ? err.message : String(err),
        ),
      );
    }
  }

  const busy = isSubmitting || preRegister.isPending;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {t("dialogs.createParcel.title")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("dialogs.createParcel.warehouse.description")}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => router.push("/parcels")}
            >
              {t("forms.actions.cancel")}
            </Button>
            <Button type="submit" disabled={busy || !warehouseId}>
              {busy ? t("forms.actions.save") + "..." : t("forms.actions.save")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="px-4">
                <CardTitle>{t("forms.sections.receiverInfo")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                <FormField
                  control={control}
                  name="recipient_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("warehouseReceiving.fields.recipientName")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="recipient_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("warehouseReceiving.fields.recipientPhone")}
                      </FormLabel>
                      <FormControl>
                        <PhoneInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="address.line1"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("warehouseReceiving.fields.addressLine1")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="address.district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("warehouseReceiving.fields.district")}
                        </FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("warehouseReceiving.fields.city")}</FormLabel>
                        <FormControl>
                          <Input {...field} autoComplete="off" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="zone_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("dialogs.createParcel.warehouse.zone")}
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? String(field.value) : ""}
                        disabled={!zones.length}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder={t(
                                "dialogs.createParcel.warehouse.zonePlaceholder",
                              )}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={String(zone.id)}>
                              {zone.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {zonesData && !zones.length
                          ? t("dialogs.createParcel.warehouse.noZones")
                          : t("dialogs.createParcel.warehouse.zoneHint")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="address.notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("warehouseReceiving.fields.notes")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={2} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="px-4">
                <CardTitle>
                  {t("dialogs.createParcel.warehouse.sectionTitle")}
                </CardTitle>
                <CardDescription>
                  {t("dialogs.createParcel.warehouse.sectionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 px-4">
                {/* Same picker as the warehouse screens: a pinned clerk sees
                    their one building as a label, not a choice. */}
                <WarehouseSelect className="w-full" />

                <FormField
                  control={control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("dialogs.createParcel.warehouse.barcode")}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          autoComplete="off"
                          className="font-mono"
                          placeholder={t(
                            "warehouseReceiving.fields.barcodePlaceholder",
                          )}
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        {t("dialogs.createParcel.warehouse.barcodeHint")}
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="tracking_ref"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("warehouseReceiving.fields.trackingRef")}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} autoComplete="off" className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {canListPudos && (
                  <FormField
                    control={control}
                    name="destination_pudo_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("dialogs.createParcel.warehouse.destination")}
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(
                              value === NONE ? undefined : Number(value),
                            )
                          }
                          value={
                            field.value !== undefined ? String(field.value) : NONE
                          }
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={NONE}>
                              {t("dialogs.createParcel.warehouse.destinationHome")}
                            </SelectItem>
                            {branches.map((pudo) => (
                              <SelectItem key={pudo.id} value={String(pudo.id)}>
                                {pudo.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
