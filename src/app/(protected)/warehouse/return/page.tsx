"use client";

import { Suspense, useState } from "react";
import { format, parse } from "date-fns";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
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
import { FailDialog } from "@/components/warehouse/WarehouseDialogs";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetSlots,
  useGetReturnReconciliation,
  useReturnParcel,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { canEmit, WHReturnEntry } from "@/lib/schema/warehouse.schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

// From docs/warehouse-api.md §2's transition table: E06 (fail) is legal only
// from out_for_delivery, and E07 (return) only from attempt_failed. A box
// still marked out_for_delivery has no recorded outcome for its trip, so the
// server rejects an E07 until an E06 supplies a reason code — that ordering
// is the entire reason this screen exists, and it's why the fail action must
// come first and the return button stays disabled until it does.
type FailTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
};

export default function ReturnPage() {
  return (
    <Suspense fallback={<ReturnSkeleton />}>
      <ReturnPageContent />
    </Suspense>
  );
}

function ReturnSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function ReturnPageContent() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const dateParam = searchParams.get("date");
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : todayStr();
  const slotIdParam = searchParams.get("slot_id");

  const { data: slotsData } = useGetSlots();
  const slots = slotsData?.slots ?? [];
  const slotId =
    slotIdParam && slots.some((s) => String(s.id) === slotIdParam)
      ? slotIdParam
      : "";

  const { warehouseId } = useResolvedWarehouseId();
  const { data, isLoading, isError } = useGetReturnReconciliation(
    slotId,
    date,
    warehouseId,
  );

  const [failTarget, setFailTarget] = useState<FailTarget | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
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
            {t("warehouseReturn.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseReturn.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <WarehouseSelect />
          <div className="w-56">
            <Select
              value={slotId || undefined}
              onValueChange={handleSlotSelect}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("warehouseReturn.slotPlaceholder")}
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
              placeholder={t("warehouseReturn.datePickerPlaceholder")}
            />
          </div>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseReturn.loadError")}
        </div>
      )}

      {!slotId ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {t("warehouseReturn.pickSlot")}
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("warehouseReturn.summary.countedOut")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {data?.counted_out ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("warehouseReturn.summary.delivered")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {data?.delivered ?? 0}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t("warehouseReturn.summary.outstanding")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-2xl font-semibold">
                {data?.outstanding ?? 0}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseReturn.outstanding.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.parcels?.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("warehouseReturn.outstanding.empty")}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("warehouseReturn.table.barcode")}
                      </TableHead>
                      <TableHead>
                        {t("warehouseReturn.table.recipient")}
                      </TableHead>
                      <TableHead>{t("warehouseReturn.table.status")}</TableHead>
                      <TableHead>{t("warehouseReturn.table.needs")}</TableHead>
                      <TableHead className="text-end">
                        {t("warehouseReturn.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.parcels.map((entry) => (
                      <OutstandingRow
                        key={entry.parcel_id}
                        entry={entry}
                        onFail={() =>
                          setFailTarget({
                            parcelId: entry.parcel_id,
                            barcode: entry.barcode,
                            recipientName: entry.recipient_name,
                          })
                        }
                      />
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {failTarget && (
        <FailDialog target={failTarget} onClose={() => setFailTarget(null)} />
      )}
    </PageContainer>
  );
}

function OutstandingRow({
  entry,
  onFail,
}: {
  entry: WHReturnEntry;
  onFail: () => void;
}) {
  const { t } = useTranslation();
  const returnParcel = useReturnParcel();
  // Minted once when this row first renders and reused across every click on
  // it (the row only leaves the outstanding list once the E07 succeeds), per
  // the client_event_id contract in useWarehouse.ts.
  const [returnEventId] = useState(() => mintClientEventId());

  const canFail = canEmit(entry.status, "E06");
  const canReturn = canEmit(entry.status, "E07");

  function handleReturn() {
    returnParcel.mutate(
      { id: entry.parcel_id, data: { client_event_id: returnEventId } },
      {
        onSuccess: (res) => {
          if (res.parcel_status === "retry_scheduled")
            toast.success(t("warehouseReturn.outcome.retryScheduled"));
          else if (res.parcel_status === "rto_pending")
            toast.success(t("warehouseReturn.outcome.rtoPending"));
        },
      },
    );
  }

  return (
    <TableRow>
      <TableCell className="font-mono">{entry.barcode}</TableCell>
      <TableCell>{entry.recipient_name}</TableCell>
      <TableCell>
        <WarehouseStatusBadge status={entry.status} />
      </TableCell>
      <TableCell className="max-w-xs text-sm text-muted-foreground">
        {t(`warehouseReturn.needs.${entry.needs}`)}
      </TableCell>
      <TableCell className="text-end">
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <div className="flex justify-end gap-2">
            {canFail && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={onFail}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("warehouseReturn.actions.recordFailedAttempt")}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant={canReturn ? "default" : "outline"}
              disabled={!canReturn || returnParcel.isPending}
              title={
                canReturn ? undefined : t("warehouseReturn.returnNotAllowed")
              }
              onClick={handleReturn}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              {t("warehouseReturn.actions.returnToWarehouse")}
            </Button>
          </div>
        </Can>
      </TableCell>
    </TableRow>
  );
}
