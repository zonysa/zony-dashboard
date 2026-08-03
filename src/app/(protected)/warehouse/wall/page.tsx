"use client";

import { Suspense, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useBinParcel,
  useGetSlots,
  useGetWall,
  useGetZones,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  BinParcelData,
  binParcelSchema,
  WHParcelStatus,
  WHSlotCatalogEntry,
  WHWallCell,
  WHWallEntry,
  WHWallSlot,
} from "@/lib/schema/warehouse.schema";
import { cn } from "@/lib/utils";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

// E02 (bin) is legal only from these two statuses — see docs/warehouse-api.md
// §2's transition table. Disable the action everywhere else rather than
// letting the server 409.
const BINNABLE_STATUSES = new Set<WHParcelStatus>(["scheduled", "needs_rebin"]);

const STATUS_BADGE: Record<
  WHParcelStatus,
  { variant: NonNullable<Parameters<typeof badgeVariants>[0]>["variant"]; className?: string }
> = {
  not_received: { variant: "outline" },
  awaiting_scheduling: { variant: "secondary" },
  scheduled: { variant: "default" },
  needs_rebin: {
    variant: "outline",
    className:
      "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  },
  ready_for_dispatch: { variant: "success" },
  out_for_delivery: { variant: "default" },
  attempt_failed: { variant: "destructive" },
  delivered: { variant: "success" },
};

type BinTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
  lockedSlotId?: number;
};

type CellSelection = {
  zoneName: string;
  slot: WHWallSlot;
  entries: WHWallEntry[];
};

export default function WallPage() {
  return (
    <Suspense fallback={<WallSkeleton />}>
      <WallPageContent />
    </Suspense>
  );
}

function WallSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function WallPageContent() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : todayStr();

  const { data, isLoading, isError } = useGetWall(date);
  const { data: zonesData } = useGetZones();
  const { data: slotsData } = useGetSlots();

  const [cellSelection, setCellSelection] = useState<CellSelection | null>(null);
  const [binTarget, setBinTarget] = useState<BinTarget | null>(null);

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", format(newDate, "yyyy-MM-dd"));
    router.replace(`${pathname}?${params.toString()}`);
  }

  // Slots are the grid's columns — runtime data straight from the response,
  // sorted so windows read left-to-right chronologically no matter how many
  // are configured.
  const slots = useMemo(
    () => [...(data?.slots ?? [])].sort((a, b) => a.starts_at.localeCompare(b.starts_at)),
    [data?.slots],
  );
  // Zones are the grid's rows — the zone list, never hardcoded either.
  const zones = useMemo(() => zonesData?.zones ?? [], [zonesData?.zones]);

  const cellByKey = useMemo(() => {
    const map = new Map<string, WHWallCell>();
    for (const cell of data?.cells ?? []) {
      map.set(`${cell.zone_id}-${cell.slot_id}`, cell);
    }
    return map;
  }, [data?.cells]);

  const zoneNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const zone of zones) map.set(zone.id, zone.name);
    return map;
  }, [zones]);

  function openBinDialog(entry: WHWallEntry, lockedSlotId?: number) {
    setBinTarget({
      parcelId: entry.parcel_id,
      barcode: entry.barcode,
      recipientName: entry.recipient_name,
      lockedSlotId,
    });
  }

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">{t("warehouseWall.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("warehouseWall.subtitle")}</p>
        </div>
        <div className="w-56">
          <DatePicker
            date={parse(date, "yyyy-MM-dd", new Date())}
            onSelect={handleDateSelect}
            placeholder={t("warehouseWall.datePickerPlaceholder")}
          />
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseWall.loadError")}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("warehouseWall.grid.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : zones.length === 0 || slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("warehouseWall.grid.empty")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="sticky start-0 z-10 min-w-32 bg-card p-2 text-start font-medium">
                      {t("warehouseWall.grid.zone")}
                    </th>
                    {slots.map((slot) => (
                      <th key={slot.slot_id} className="min-w-32 p-2 text-center font-medium">
                        <div>{isRTL ? slot.label_ar : slot.label_en}</div>
                        <div className="text-xs font-normal text-muted-foreground">{slot.code}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone) => (
                    <tr key={zone.id} className="border-t">
                      <td className="sticky start-0 z-10 bg-card p-2 font-medium">{zone.name}</td>
                      {slots.map((slot) => {
                        const cell = cellByKey.get(`${zone.id}-${slot.slot_id}`);
                        const rebinCount =
                          cell?.parcels.filter((p) => p.status === "needs_rebin").length ?? 0;
                        const hasParcels = !!cell && cell.count > 0;

                        return (
                          <td key={slot.slot_id} className="p-2 text-center align-top">
                            <button
                              type="button"
                              disabled={!hasParcels}
                              onClick={() =>
                                cell &&
                                setCellSelection({
                                  zoneName: zone.name,
                                  slot,
                                  entries: cell.parcels,
                                })
                              }
                              className={cn(
                                "flex w-full flex-col items-center gap-0.5 rounded-md border px-3 py-2 transition-colors",
                                hasParcels
                                  ? "cursor-pointer hover:bg-accent"
                                  : "cursor-default border-dashed text-muted-foreground",
                                rebinCount > 0 &&
                                  "border-purple-400 bg-purple-50 dark:bg-purple-950/20",
                              )}
                            >
                              <span className="text-lg font-semibold">{cell?.count ?? 0}</span>
                              {rebinCount > 0 && (
                                <span className="flex items-center gap-1 text-xs text-purple-700 dark:text-purple-400">
                                  <RefreshCw className="h-3 w-3" />
                                  {t("warehouseWall.grid.needsRebin", { count: rebinCount })}
                                </span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("warehouseWall.awaiting.title")}</CardTitle>
          <Badge variant="secondary">{data?.awaiting_count ?? 0}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.awaiting_scheduling?.length ? (
            <p className="text-sm text-muted-foreground">{t("warehouseWall.awaiting.empty")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseWall.table.barcode")}</TableHead>
                  <TableHead>{t("warehouseWall.table.recipient")}</TableHead>
                  <TableHead>{t("warehouseWall.table.zone")}</TableHead>
                  <TableHead>{t("warehouseWall.table.status")}</TableHead>
                  <TableHead>{t("warehouseWall.table.bin")}</TableHead>
                  <TableHead className="text-end">{t("warehouseWall.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...data.awaiting_scheduling]
                  .sort((a, b) => Number(!!b.stale_slot) - Number(!!a.stale_slot))
                  .map((entry) => (
                    <WallEntryRow
                      key={entry.parcel_id}
                      entry={entry}
                      showZone
                      zoneName={entry.zone_id ? zoneNameById.get(entry.zone_id) : undefined}
                      onBin={() => openBinDialog(entry)}
                    />
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={!!cellSelection}
        onOpenChange={(open) => !open && setCellSelection(null)}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {cellSelection?.zoneName} ·{" "}
              {cellSelection && (isRTL ? cellSelection.slot.label_ar : cellSelection.slot.label_en)}
            </DialogTitle>
            <DialogDescription>
              {t("warehouseWall.cellDialog.subtitle", {
                count: cellSelection?.entries.length ?? 0,
              })}
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("warehouseWall.table.barcode")}</TableHead>
                <TableHead>{t("warehouseWall.table.recipient")}</TableHead>
                <TableHead>{t("warehouseWall.table.status")}</TableHead>
                <TableHead>{t("warehouseWall.table.bin")}</TableHead>
                <TableHead className="text-end">{t("warehouseWall.table.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cellSelection?.entries.map((entry) => (
                <WallEntryRow
                  key={entry.parcel_id}
                  entry={entry}
                  onBin={() => openBinDialog(entry, cellSelection.slot.slot_id)}
                />
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      {binTarget && (
        <BinDialog
          target={binTarget}
          slots={slotsData?.slots ?? []}
          onClose={() => setBinTarget(null)}
        />
      )}
    </PageContainer>
  );
}

function WallEntryRow({
  entry,
  showZone,
  zoneName,
  onBin,
}: {
  entry: WHWallEntry;
  showZone?: boolean;
  zoneName?: string;
  onBin: () => void;
}) {
  const { t } = useTranslation();
  const binnable = BINNABLE_STATUSES.has(entry.status);
  const statusStyle = STATUS_BADGE[entry.status];

  return (
    <TableRow className={entry.stale_slot ? "bg-amber-50 dark:bg-amber-950/20" : undefined}>
      <TableCell className="font-mono">{entry.barcode}</TableCell>
      <TableCell>{entry.recipient_name}</TableCell>
      {showZone && <TableCell>{zoneName ?? "—"}</TableCell>}
      <TableCell>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={statusStyle.variant} className={statusStyle.className}>
            {t(`warehouseWall.status.${entry.status}`)}
          </Badge>
          {entry.status === "needs_rebin" && (
            <RefreshCw
              className="h-3.5 w-3.5 shrink-0 text-purple-600 dark:text-purple-400"
              aria-label={t("warehouseWall.needsRebinHint")}
            />
          )}
          {entry.stale_slot && (
            <Badge
              variant="outline"
              className="border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
            >
              <AlertTriangle className="h-3 w-3" />
              {t("warehouseWall.stale")}
            </Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">{entry.bin_code ?? "—"}</TableCell>
      <TableCell className="text-end">
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!binnable}
            title={binnable ? undefined : t("warehouseWall.binNotAllowed")}
            onClick={onBin}
          >
            {t("warehouseWall.actions.bin")}
          </Button>
        </Can>
      </TableCell>
    </TableRow>
  );
}

function BinDialog({
  target,
  slots,
  onClose,
}: {
  target: BinTarget;
  slots: WHSlotCatalogEntry[];
  onClose: () => void;
}) {
  const { t, isRTL } = useTranslation();
  const binParcel = useBinParcel();
  // Minted once, when this dialog opens for this parcel — reused across any
  // retry of the same bin attempt, per the client_event_id contract in
  // useWarehouse.ts.
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<BinParcelData>({
    resolver: zodResolver(binParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      slot_id: target.lockedSlotId,
      bin_code: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: BinParcelData) {
    try {
      await binParcel.mutateAsync({ id: target.parcelId, data });
      onClose();
    } catch (err) {
      // useBinParcel's onError already toasts the server message.
      console.error("Bin action failed:", err);
    }
  }

  const lockedSlot = slots.find((s) => s.id === target.lockedSlotId);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseWall.binDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} · <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {target.lockedSlotId ? (
              <div className="text-sm">
                <span className="text-muted-foreground">{t("warehouseWall.binDialog.slot")}: </span>
                <span className="font-medium">
                  {lockedSlot ? (isRTL ? lockedSlot.label_ar : lockedSlot.label_en) : target.lockedSlotId}
                </span>
              </div>
            ) : (
              <FormField
                control={control}
                name="slot_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("warehouseWall.binDialog.slot")}</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value ? String(field.value) : undefined}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t("warehouseWall.binDialog.slotPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={control}
              name="bin_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("warehouseWall.binDialog.binCode")}</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus autoComplete="off" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("warehouseWall.binDialog.notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseWall.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("warehouseWall.binDialog.submitting")
                  : t("warehouseWall.binDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
