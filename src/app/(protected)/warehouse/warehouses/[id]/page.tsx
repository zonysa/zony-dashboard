"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Info, Trash2, UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import {
  useAssignWarehouseStaff,
  useGetWarehouse,
  useGetWarehouseStaff,
  useGetWarehouseStaffCandidates,
  useUnassignWarehouseStaff,
  useUpdateWarehouse,
} from "@/lib/hooks/useWarehouse";
import { useGetZones } from "@/lib/hooks/useZone";
import { Permission } from "@/lib/rbac/permissions";
import {
  WarehouseUpdateData,
  warehouseUpdateSchema,
} from "@/lib/schema/warehouse.schema";

export default function WarehouseDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const warehouseId = Number(params.id);

  const { data, isLoading, isError } = useGetWarehouse(
    Number.isFinite(warehouseId) ? warehouseId : null,
  );
  const warehouse = data?.warehouse;

  return (
    <PageContainer size="lg" className="px-6 py-10">
      <div className="mb-6 flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          aria-label={t("warehouseBuildings.title")}
          onClick={() => router.push("/warehouse/warehouses")}
        >
          <ArrowLeft className="h-5 w-5 rtl:-scale-x-100" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {warehouse?.name ?? t("warehouseBuildings.detail.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {warehouse ? (
              <span className="font-mono">{warehouse.code}</span>
            ) : (
              t("warehouseBuildings.detail.subtitle")
            )}
          </p>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseBuildings.loadError")}
        </div>
      )}

      {isLoading || !warehouse ? (
        <div className="space-y-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          <EditWarehouseCard warehouseId={warehouseId} />
          <StaffRosterCard warehouseId={warehouseId} />
        </div>
      )}
    </PageContainer>
  );
}

function EditWarehouseCard({ warehouseId }: { warehouseId: number }) {
  const { t } = useTranslation();
  const { data } = useGetWarehouse(warehouseId);
  const updateWarehouse = useUpdateWarehouse(warehouseId);
  const warehouse = data?.warehouse;

  const form = useForm<WarehouseUpdateData>({
    resolver: zodResolver(warehouseUpdateSchema),
    defaultValues: {},
  });

  const { control, handleSubmit, reset, watch } = form;
  const cityId = watch("city_id");

  const { data: citiesData } = useGetCities();
  const { data: zonesData } = useGetZones(
    cityId ? { cityId: Number(cityId) } : undefined,
  );

  // Seeded once the record arrives — the form mounts before the fetch lands.
  useEffect(() => {
    if (!warehouse) return;
    reset({
      name: warehouse.name,
      code: warehouse.code,
      address: warehouse.address,
      phone_number: warehouse.phone_number ?? "",
      status: warehouse.status,
      city_id: warehouse.city_id,
      zone_id: warehouse.zone_id,
    });
  }, [warehouse, reset]);

  async function onSubmit(values: WarehouseUpdateData) {
    try {
      await updateWarehouse.mutateAsync({
        ...values,
        phone_number: values.phone_number || undefined,
      });
    } catch (err) {
      // useUpdateWarehouse's onError already toasts the server message.
      console.error("Update warehouse failed:", err);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("warehouseBuildings.detail.detailsTitle")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("warehouseBuildings.detail.detailsSubtitle")}
        </p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseBuildings.fields.name")}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
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
                    <FormLabel>{t("warehouseBuildings.fields.code")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ""}
                        className="font-mono"
                      />
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
                    <Input {...field} value={field.value ?? ""} />
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
                    <FormLabel>{t("warehouseBuildings.fields.city")}</FormLabel>
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
                    <FormLabel>{t("warehouseBuildings.fields.zone")}</FormLabel>
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
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(["active", "inactive", "suspended"] as const).map(
                          (s) => (
                            <SelectItem key={s} value={s}>
                              {t(`warehouseBuildings.status.${s}`)}
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
              <Button type="submit" disabled={updateWarehouse.isPending}>
                {updateWarehouse.isPending
                  ? t("warehouseBuildings.actions.saving")
                  : t("warehouseBuildings.actions.save")}
              </Button>
            </Can>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

function StaffRosterCard({ warehouseId }: { warehouseId: number }) {
  const { t } = useTranslation();
  const { data, isLoading } = useGetWarehouseStaff(warehouseId);
  const { data: candidatesData } = useGetWarehouseStaffCandidates(warehouseId);
  const assign = useAssignWarehouseStaff(warehouseId);
  const unassign = useUnassignWarehouseStaff(warehouseId);

  const [selectedUser, setSelectedUser] = useState<string>("");
  const [removeTarget, setRemoveTarget] = useState<{
    userId: string;
    username: string;
  } | null>(null);

  const staff = data?.staff ?? [];
  const candidates = candidatesData?.candidates ?? [];

  function handleAssign() {
    if (!selectedUser) return;
    assign.mutate(selectedUser, { onSuccess: () => setSelectedUser("") });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("warehouseBuildings.staff.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("warehouseBuildings.staff.subtitle")}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The consequence of assigning is not obvious from the control, so
            it is stated: one warehouse per person is a database constraint,
            and assigning someone who works elsewhere moves them. */}
        <div className="flex gap-3 rounded-lg border bg-muted/40 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-snug text-muted-foreground">
            {t("warehouseBuildings.staff.note")}
          </p>
        </div>

        <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
          <div className="flex flex-wrap items-end gap-3">
            <div className="w-80">
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t("warehouseBuildings.staff.selectUser")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((user) => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() ||
                        user.username ||
                        user.email}
                      {/* Assigning MOVES someone, so where they work now has
                          to be visible before the click, not after. */}
                      {user.current_warehouse_name ? (
                        <span className="ms-2 text-xs text-amber-600 dark:text-amber-500">
                          {t("warehouseBuildings.staff.currentlyAt", {
                            warehouse: user.current_warehouse_name,
                          })}
                        </span>
                      ) : (
                        <span className="ms-2 text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={!selectedUser || assign.isPending}
            >
              <UserPlus className="h-4 w-4" />
              {assign.isPending
                ? t("warehouseBuildings.actions.saving")
                : t("warehouseBuildings.staff.assign")}
            </Button>
          </div>
          {/* An empty list is not an error and not a loading state — there is
              simply nobody in the role yet. Say where they come from. */}
          {!candidates.length && (
            <p className="text-sm text-muted-foreground">
              {t("warehouseBuildings.staff.noCandidates")}
            </p>
          )}
        </Can>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !staff.length ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t("warehouseBuildings.staff.empty")}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("warehouseBuildings.staff.user")}</TableHead>
                <TableHead>{t("warehouseBuildings.staff.email")}</TableHead>
                <TableHead>{t("warehouseBuildings.staff.role")}</TableHead>
                <TableHead>{t("warehouseBuildings.staff.assignedAt")}</TableHead>
                <TableHead className="text-end">
                  {t("warehouseBuildings.staff.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map((member) => (
                <TableRow key={member.user_id}>
                  <TableCell className="font-medium">
                    {member.username}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{member.role ?? "—"}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.assigned_at}
                  </TableCell>
                  <TableCell className="text-end">
                    <Can do={Permission.EDIT_WAREHOUSE_SETTINGS}>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setRemoveTarget({
                            userId: member.user_id,
                            username: member.username,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </Can>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("warehouseBuildings.staff.removeConfirm.title")}
            </AlertDialogTitle>
            {/* Removing someone locks them out of every warehouse screen
                until they are assigned again — that is the intended effect,
                but it should not be a surprise. */}
            <AlertDialogDescription>
              {t("warehouseBuildings.staff.removeConfirm.description", {
                name: removeTarget?.username ?? "",
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("warehouseBuildings.actions.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (removeTarget) unassign.mutate(removeTarget.userId);
                setRemoveTarget(null);
              }}
            >
              {t("warehouseBuildings.staff.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
