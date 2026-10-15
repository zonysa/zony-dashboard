"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Truck } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetCarriers, useSaveCarrier } from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  CarrierFormData,
  carrierFormSchema,
  WHCarrier,
} from "@/lib/schema/warehouse.schema";
import { normalizeSaudiPhone } from "@/lib/validators/phone";

export default function CarriersPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useGetCarriers();
  // `null` = closed, `"new"` = create, otherwise the carrier being edited.
  const [editing, setEditing] = useState<WHCarrier | "new" | null>(null);

  const carriers = data?.carriers ?? [];

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseCarriers.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseCarriers.subtitle")}
          </p>
        </div>
        <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
          <Button onClick={() => setEditing("new")}>
            <Plus className="h-4 w-4" />
            {t("warehouseCarriers.actions.create")}
          </Button>
        </Can>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseCarriers.loadError")}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !carriers.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Truck className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {t("warehouseCarriers.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseCarriers.table.code")}</TableHead>
                  <TableHead>{t("warehouseCarriers.table.name")}</TableHead>
                  <TableHead>{t("warehouseCarriers.table.phone")}</TableHead>
                  <TableHead>{t("warehouseCarriers.table.status")}</TableHead>
                  <TableHead className="text-end">
                    {t("warehouseCarriers.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {carriers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono">{c.code}</TableCell>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell dir="ltr" className="text-start">
                      {c.contact_phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.is_active ? "success" : "secondary"}>
                        {c.is_active
                          ? t("warehouseCarriers.active")
                          : t("warehouseCarriers.inactive")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(c)}
                        >
                          {t("warehouseCarriers.actions.edit")}
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
        <CarrierDialog
          carrier={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </PageContainer>
  );
}

function CarrierDialog({
  carrier,
  onClose,
}: {
  carrier: WHCarrier | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const save = useSaveCarrier();

  const form = useForm<CarrierFormData>({
    resolver: zodResolver(carrierFormSchema),
    defaultValues: {
      code: carrier?.code ?? "",
      name: carrier?.name ?? "",
      contact_phone: normalizeSaudiPhone(carrier?.contact_phone ?? ""),
      is_active: carrier?.is_active ?? true,
    },
  });
  const { control, handleSubmit } = form;

  async function onSubmit(v: CarrierFormData) {
    try {
      await save.mutateAsync({
        id: carrier?.id,
        data: {
          code: v.code,
          name: v.name,
          contact_phone: v.contact_phone || null,
          is_active: v.is_active,
        },
      });
      onClose();
    } catch (err) {
      // useSaveCarrier's onError already toasts the server message.
      console.error("Save carrier failed:", err);
    }
  }

  const text = (
    name: "code" | "name" | "contact_phone",
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {carrier
              ? t("warehouseCarriers.dialog.editTitle")
              : t("warehouseCarriers.dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {t("warehouseCarriers.dialog.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {text("code", t("warehouseCarriers.fields.code"), true)}
            {text("name", t("warehouseCarriers.fields.name"))}
            {text("contact_phone", t("warehouseCarriers.fields.phone"), true)}
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
                    {t("warehouseCarriers.fields.active")}
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
                  ? t("warehouseCarriers.dialog.saving")
                  : t("warehouseCarriers.dialog.save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
