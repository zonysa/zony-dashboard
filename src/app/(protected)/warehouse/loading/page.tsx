"use client";

import { Suspense, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, Store } from "lucide-react";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
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
import { Textarea } from "@/components/ui/textarea";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { usePudoNames } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useAssignParcel,
  useBulkAssign,
  useCheckoutParcel,
  useGetCouriers,
  useGetLoadingManifest,
  useGetSlots,
  useGetZones,
  useUnassignParcel,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  assignParcelSchema,
  AssignParcelData,
  canEmit,
  checkoutParcelSchema,
  CheckoutParcelData,
  WHCourier,
  WHLoadingEntry,
} from "@/lib/schema/warehouse.schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

function courierLabel(c: WHCourier): string {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  return name || c.username;
}

type CheckoutTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
  assignedCourierId: string | null;
};

type AssignTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
  assignedCourierId: string | null;
};

export default function LoadingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <LoadingPageContent />
    </Suspense>
  );
}

function LoadingSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function LoadingPageContent() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : todayStr();
  const slotIdParam = searchParams.get("slot_id");

  const { warehouseId } = useResolvedWarehouseId();
  const { data: slotsData } = useGetSlots();
  const { data: zonesData } = useGetZones(warehouseId);
  const { data: couriersData } = useGetCouriers(warehouseId);
  const slots = useMemo(() => slotsData?.slots ?? [], [slotsData?.slots]);
  const couriers = useMemo(
    () => couriersData?.couriers ?? [],
    [couriersData?.couriers],
  );
  const courierNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of couriers) map.set(c.user_id, courierLabel(c));
    return map;
  }, [couriers]);
  const zoneNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const zone of zonesData?.zones ?? []) map.set(zone.id, zone.name);
    return map;
  }, [zonesData?.zones]);

  const slotId =
    slotIdParam && slots.some((s) => String(s.id) === slotIdParam)
      ? slotIdParam
      : "";

  const { data, isLoading, isError } = useGetLoadingManifest(
    slotId,
    date,
    warehouseId,
  );
  const { nameById: pudoNameById } = usePudoNames();

  // Grouped by van run — home deliveries first, then each shop together — so
  // the boxes for one run are loaded side by side. Stable within a run.
  const parcels = useMemo(
    () =>
      [...(data?.parcels ?? [])].sort(
        (a, b) =>
          Number(a.destination === "pudo") - Number(b.destination === "pudo") ||
          (a.destination_pudo_id ?? 0) - (b.destination_pudo_id ?? 0),
      ),
    [data?.parcels],
  );

  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(
    null,
  );
  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  // Only ready_for_delivery/assigned parcels can take an E03 assignment.
  const assignableIds = useMemo(
    () => parcels.filter((p) => canEmit(p.status, "E03")).map((p) => p.parcel_id),
    [parcels],
  );
  const selectedAssignable = useMemo(
    () => [...selected].filter((id) => assignableIds.includes(id)),
    [selected, assignableIds],
  );

  function toggleSelected(id: string, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
    setSelected(new Set());
  }

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;
    updateParam("date", format(newDate, "yyyy-MM-dd"));
  }

  function handleSlotSelect(value: string) {
    updateParam("slot_id", value);
  }

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseLoading.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseLoading.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <WarehouseSelect />
          <div className="w-56">
            <Select value={slotId || undefined} onValueChange={handleSlotSelect}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("warehouseLoading.slotPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {slots
                  .filter((slot) => slot.is_active)
                  .map((slot) => (
                    <SelectItem key={slot.id} value={String(slot.id)}>
                      {isRTL ? slot.label_ar : slot.label_en}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-56">
            <DatePicker
              date={parse(date, "yyyy-MM-dd", new Date())}
              onSelect={handleDateSelect}
              placeholder={t("warehouseLoading.datePickerPlaceholder")}
            />
          </div>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseLoading.loadError")}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("warehouseLoading.manifest.title")}</CardTitle>
          <div className="flex items-center gap-3">
            <Can do={Permission.MANAGE_WAREHOUSE}>
              {selectedAssignable.length > 0 && (
                <Button size="sm" onClick={() => setBulkOpen(true)}>
                  {t("warehouseLoading.actions.assignSelected")} (
                  {selectedAssignable.length})
                </Button>
              )}
            </Can>
            <Badge variant="secondary">{data?.count ?? 0}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!slotId ? (
            <p className="text-sm text-muted-foreground">
              {t("warehouseLoading.manifest.pickSlot")}
            </p>
          ) : isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !parcels.length ? (
            <p className="text-sm text-muted-foreground">
              {t("warehouseLoading.manifest.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>{t("warehouseLoading.table.barcode")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.recipient")}</TableHead>
                  <TableHead>
                    {t("warehouseLoading.table.destination")}
                  </TableHead>
                  <TableHead>{t("warehouseLoading.table.zone")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.courier")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.status")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.bin")}</TableHead>
                  <TableHead className="text-end">
                    {t("warehouseLoading.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((entry) => (
                  <ManifestRow
                    key={entry.parcel_id}
                    entry={entry}
                    pudoName={
                      entry.destination_pudo_id != null
                        ? pudoNameById.get(entry.destination_pudo_id)
                        : undefined
                    }
                    zoneName={
                      entry.zone_id
                        ? zoneNameById.get(entry.zone_id)
                        : undefined
                    }
                    courierName={
                      entry.assigned_courier_id
                        ? courierNameById.get(entry.assigned_courier_id)
                        : undefined
                    }
                    selectable={canEmit(entry.status, "E03")}
                    selected={selected.has(entry.parcel_id)}
                    onSelectedChange={(on) =>
                      toggleSelected(entry.parcel_id, on)
                    }
                    onCheckout={() =>
                      setCheckoutTarget({
                        parcelId: entry.parcel_id,
                        barcode: entry.barcode,
                        recipientName: entry.recipient_name,
                        assignedCourierId: entry.assigned_courier_id,
                      })
                    }
                    onAssign={() =>
                      setAssignTarget({
                        parcelId: entry.parcel_id,
                        barcode: entry.barcode,
                        recipientName: entry.recipient_name,
                        assignedCourierId: entry.assigned_courier_id,
                      })
                    }
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {checkoutTarget && (
        <CheckoutDialog
          target={checkoutTarget}
          courierName={
            checkoutTarget.assignedCourierId
              ? courierNameById.get(checkoutTarget.assignedCourierId)
              : undefined
          }
          onClose={() => setCheckoutTarget(null)}
        />
      )}

      {assignTarget && (
        <AssignDialog
          target={assignTarget}
          couriers={couriers}
          onClose={() => setAssignTarget(null)}
        />
      )}

      {bulkOpen && (
        <BulkAssignDialog
          parcelIds={selectedAssignable}
          couriers={couriers}
          onClose={(done) => {
            setBulkOpen(false);
            if (done) setSelected(new Set());
          }}
        />
      )}
    </PageContainer>
  );
}

function ManifestRow({
  entry,
  pudoName,
  zoneName,
  courierName,
  selectable,
  selected,
  onSelectedChange,
  onCheckout,
  onAssign,
}: {
  entry: WHLoadingEntry;
  // Undefined for a role that can't list PUDOs; the bare id shows instead.
  pudoName?: string;
  zoneName?: string;
  courierName?: string;
  selectable: boolean;
  selected: boolean;
  onSelectedChange: (on: boolean) => void;
  onCheckout: () => void;
  onAssign: () => void;
}) {
  const { t } = useTranslation();
  const checkoutable = canEmit(entry.status, "E04");
  const assignable = canEmit(entry.status, "E03");
  // Server refuses E04 without an assignment while assignment_required is on
  // (the default), so gate the button on it too.
  const canCheckout = checkoutable && !!entry.assigned_courier_id;

  return (
    <TableRow>
      <TableCell>
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <Checkbox
            checked={selected}
            disabled={!selectable}
            onCheckedChange={(v) => onSelectedChange(v === true)}
            aria-label={entry.barcode}
          />
        </Can>
      </TableCell>
      <TableCell className="font-mono">{entry.barcode}</TableCell>
      <TableCell>{entry.recipient_name}</TableCell>
      <TableCell>
        {entry.destination === "pudo" ? (
          <Badge variant="outline" className="gap-1">
            <Store className="h-3 w-3" />
            {pudoName ?? `#${entry.destination_pudo_id}`}
          </Badge>
        ) : (
          <Badge variant="muted" className="gap-1">
            <Home className="h-3 w-3" />
            {t("warehouseLoading.destination.customer")}
          </Badge>
        )}
      </TableCell>
      <TableCell>{zoneName ?? "—"}</TableCell>
      <TableCell>
        {courierName ?? (
          <span className="text-muted-foreground">
            {t("warehouseLoading.unassigned")}
          </span>
        )}
      </TableCell>
      <TableCell>
        <WarehouseStatusBadge status={entry.status} />
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">
        {entry.bin_code ?? "—"}
      </TableCell>
      <TableCell className="text-end">
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <div className="flex items-center justify-end gap-2">
            {assignable && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={onAssign}
              >
                {entry.assigned_courier_id
                  ? t("warehouseLoading.actions.reassign")
                  : t("warehouseLoading.actions.assign")}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!canCheckout}
              title={
                !checkoutable
                  ? t("warehouseLoading.checkoutNotAllowed")
                  : !entry.assigned_courier_id
                    ? t("warehouseLoading.assignFirst")
                    : undefined
              }
              onClick={onCheckout}
            >
              {t("warehouseLoading.actions.checkout")}
            </Button>
          </div>
        </Can>
      </TableCell>
    </TableRow>
  );
}

// Checkout (E04) no longer picks a courier: the server takes it from the E03
// assignment and 409s on a mismatch. So this just confirms, showing which
// courier the box goes out with.
function CheckoutDialog({
  target,
  courierName,
  onClose,
}: {
  target: CheckoutTarget;
  courierName?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const checkoutParcel = useCheckoutParcel();
  // Minted once, when this dialog opens for this parcel — reused across any
  // retry of the same checkout attempt, per the client_event_id contract.
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<CheckoutParcelData>({
    resolver: zodResolver(checkoutParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: CheckoutParcelData) {
    try {
      // No courier_id — the assignment owns it.
      await checkoutParcel.mutateAsync({
        id: target.parcelId,
        data: { client_event_id: data.client_event_id, notes: data.notes },
      });
      onClose();
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("warehouseLoading.checkoutDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            {t("warehouseLoading.checkoutDialog.assignedCourier")}:{" "}
          </span>
          <span className="font-medium">
            {courierName ?? t("warehouseLoading.unassigned")}
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.checkoutDialog.notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseLoading.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("warehouseLoading.checkoutDialog.submitting")
                  : t("warehouseLoading.checkoutDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// E03 — assign or reassign a single parcel to a courier, or remove the
// assignment. The couriers come from /warehouse/couriers (active, with a
// per-warehouse assigned count) rather than the legacy /users role filter.
function AssignDialog({
  target,
  couriers,
  onClose,
}: {
  target: AssignTarget;
  couriers: WHCourier[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assign = useAssignParcel();
  const unassign = useUnassignParcel();
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<AssignParcelData>({
    resolver: zodResolver(assignParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      courier_id: target.assignedCourierId ?? "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: AssignParcelData) {
    try {
      await assign.mutateAsync({ id: target.parcelId, data });
      onClose();
    } catch (err) {
      console.error("Assign failed:", err);
    }
  }

  async function onUnassign() {
    try {
      await unassign.mutateAsync({
        id: target.parcelId,
        data: { client_event_id: clientEventId },
      });
      onClose();
    } catch (err) {
      console.error("Unassign failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseLoading.assignDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="courier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.assignDialog.courier")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "warehouseLoading.assignDialog.courierPlaceholder",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {couriers.map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>
                          {courierLabel(c)} ·{" "}
                          <span className="text-muted-foreground">
                            {t("warehouseLoading.assignDialog.assignedCount", {
                              count: c.assigned_count,
                            })}
                          </span>
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
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.assignDialog.notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:justify-between">
              {target.assignedCourierId ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  disabled={unassign.isPending}
                  onClick={onUnassign}
                >
                  {unassign.isPending
                    ? t("warehouseLoading.assignDialog.unassigning")
                    : t("warehouseLoading.assignDialog.unassignSubmit")}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("warehouseLoading.actions.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("warehouseLoading.assignDialog.submitting")
                    : t("warehouseLoading.assignDialog.submit")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Assign one courier to every selected parcel. Partial success is fine — the
// hook reports both counts. One client_event_id (a prefix the server expands
// per parcel) is minted when the dialog opens.
function BulkAssignDialog({
  parcelIds,
  couriers,
  onClose,
}: {
  parcelIds: string[];
  couriers: WHCourier[];
  onClose: (done: boolean) => void;
}) {
  const { t } = useTranslation();
  const bulkAssign = useBulkAssign();
  const [clientEventId] = useState(() => mintClientEventId());
  const [courierId, setCourierId] = useState("");

  async function onSubmit() {
    if (!courierId) return;
    try {
      await bulkAssign.mutateAsync({
        client_event_id: clientEventId,
        courier_id: courierId,
        parcel_ids: parcelIds,
      });
      onClose(true);
    } catch (err) {
      console.error("Bulk assign failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose(false)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("warehouseLoading.assignDialog.bulkTitle", {
              count: parcelIds.length,
            })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("warehouseLoading.assignDialog.courier")}
          </label>
          <Select value={courierId || undefined} onValueChange={setCourierId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t(
                  "warehouseLoading.assignDialog.courierPlaceholder",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {couriers.map((c) => (
                <SelectItem key={c.user_id} value={c.user_id}>
                  {courierLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onClose(false)}>
            {t("warehouseLoading.actions.cancel")}
          </Button>
          <Button
            type="button"
            disabled={!courierId || bulkAssign.isPending}
            onClick={onSubmit}
          >
            {bulkAssign.isPending
              ? t("warehouseLoading.assignDialog.submitting")
              : t("warehouseLoading.assignDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
