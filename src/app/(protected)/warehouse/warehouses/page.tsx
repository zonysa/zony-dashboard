"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Plus } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useCreateWarehouse, useGetWarehouses } from "@/lib/hooks/useWarehouse";
import { useGetZones } from "@/lib/hooks/useZone";
import { Permission } from "@/lib/rbac/permissions";
import {
  WarehouseCreateData,
  warehouseCreateSchema,
  WHWarehouseStatus,
} from "@/lib/schema/warehouse.schema";

const STATUS_BADGE: Record<
  WHWarehouseStatus,
  "default" | "secondary" | "destructive" | "success" | "outline"
> = {
  active: "success",
  inactive: "secondary",
  suspended: "destructive",
};

export default function WarehousesPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetWarehouses();
  const [createOpen, setCreateOpen] = useState(false);

  const warehouses = data?.warehouses ?? [];

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseBuildings.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseBuildings.subtitle")}
          </p>
        </div>
        <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t("warehouseBuildings.actions.create")}
          </Button>
        </Can>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseBuildings.loadError")}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !warehouses.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("warehouseBuildings.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseBuildings.table.code")}</TableHead>
                  <TableHead>{t("warehouseBuildings.table.name")}</TableHead>
                  <TableHead>{t("warehouseBuildings.table.city")}</TableHead>
                  <TableHead>{t("warehouseBuildings.table.zone")}</TableHead>
                  <TableHead>{t("warehouseBuildings.table.address")}</TableHead>
                  <TableHead>{t("warehouseBuildings.table.status")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/warehouse/warehouses/${w.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {w.code}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{w.name}</TableCell>
                    <TableCell>{w.city_name ?? "—"}</TableCell>
                    <TableCell>{w.zone_name ?? "—"}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {w.address}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[w.status]}>
                        {t(`warehouseBuildings.status.${w.status}`)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {createOpen && (
        <CreateWarehouseDialog onClose={() => setCreateOpen(false)} />
      )}
    </PageContainer>
  );
}

function CreateWarehouseDialog({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const createWarehouse = useCreateWarehouse();

  const form = useForm<WarehouseCreateData>({
    resolver: zodResolver(warehouseCreateSchema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      phone_number: "",
      status: "active",
      city_id: undefined,
      zone_id: null,
    },
  });

  const { control, handleSubmit, watch } = form;
  const cityId = watch("city_id");

  const { data: citiesData } = useGetCities();
  // Zones are city-scoped in the main flow, so the list only makes sense once
  // a city is picked — same cascade the PUDO and zone forms use.
  const { data: zonesData } = useGetZones(
    cityId ? { cityId: Number(cityId) } : undefined,
  );

  async function onSubmit(values: WarehouseCreateData) {
    try {
      await createWarehouse.mutateAsync({
        ...values,
        phone_number: values.phone_number || undefined,
      });
      onClose();
    } catch (err) {
      // useCreateWarehouse's onError already toasts the server message.
      console.error("Create warehouse failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("warehouseBuildings.createDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("warehouseBuildings.createDialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.name")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} autoFocus />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.code")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseBuildings.fields.address")}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="city_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.city")}
                    </FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "warehouseBuildings.fields.cityPlaceholder",
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
              <FormField
                control={control}
                name="zone_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.zone")}
                    </FormLabel>
                    <Select
                      disabled={!cityId}
                      onValueChange={(v) => field.onChange(Number(v))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue
                            placeholder={t(
                              "warehouseBuildings.fields.zonePlaceholder",
                            )}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(zonesData?.zones ?? []).map((zone) => (
                          <SelectItem key={zone.id} value={String(zone.id)}>
                            {zone.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.phone")}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("warehouseBuildings.fields.status")}
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(
                          ["active", "inactive", "suspended"] as const
                        ).map((s) => (
                          <SelectItem key={s} value={s}>
                            {t(`warehouseBuildings.status.${s}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseBuildings.actions.cancel")}
              </Button>
              <Button type="submit" disabled={createWarehouse.isPending}>
                {createWarehouse.isPending
                  ? t("warehouseBuildings.actions.saving")
                  : t("warehouseBuildings.actions.create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
