"use client";

import { Suspense, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Home, Store } from "lucide-react";

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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import {
  AssignDialog,
  AssignTarget,
  CheckoutDialog,
  CheckoutTarget,
  courierLabel,
} from "@/components/warehouse/WarehouseDialogs";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { usePudoNames } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useBulkAssign,
  useGetCouriers,
  useGetLoadingManifest,
  useGetSlots,
  useGetZones,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  canEmit,
  WHCourier,
  WHLoadingEntry,
} from "@/lib/schema/warehouse.schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}



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
