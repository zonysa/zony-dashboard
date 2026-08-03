"use client";

import { Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { AlertTriangle, ArrowRight } from "lucide-react";
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
  useFailParcel,
  useGetFailureReasons,
  useGetSlots,
  useGetReturnReconciliation,
  useReturnParcel,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  failParcelSchema,
  FailParcelData,
  WHParcelStatus,
  WHReturnEntry,
} from "@/lib/schema/warehouse.schema";

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
const CAN_FAIL_STATUSES = new Set<WHParcelStatus>(["out_for_delivery"]);
const CAN_RETURN_STATUSES = new Set<WHParcelStatus>(["attempt_failed"]);

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
  const slotId = slotIdParam && slots.some((s) => String(s.id) === slotIdParam) ? slotIdParam : "";

  const { data, isLoading, isError } = useGetReturnReconciliation(slotId, date);

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
          <h1 className="text-xl font-semibold text-foreground">{t("warehouseReturn.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("warehouseReturn.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Select value={slotId || undefined} onValueChange={handleSlotSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("warehouseReturn.slotPlaceholder")} />
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
            <p className="text-sm text-muted-foreground">{t("warehouseReturn.pickSlot")}</p>
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
                {data?.outstanding?.length ?? 0}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseReturn.outstanding.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              {!data?.outstanding?.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("warehouseReturn.outstanding.empty")}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("warehouseReturn.table.barcode")}</TableHead>
                      <TableHead>{t("warehouseReturn.table.recipient")}</TableHead>
                      <TableHead>{t("warehouseReturn.table.status")}</TableHead>
                      <TableHead>{t("warehouseReturn.table.needs")}</TableHead>
                      <TableHead className="text-end">
                        {t("warehouseReturn.table.actions")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.outstanding.map((entry) => (
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

      {failTarget && <FailDialog target={failTarget} onClose={() => setFailTarget(null)} />}
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

  const canFail = CAN_FAIL_STATUSES.has(entry.status);
  const canReturn = CAN_RETURN_STATUSES.has(entry.status);
  const statusStyle = STATUS_BADGE[entry.status];

  function handleReturn() {
    returnParcel.mutate({
      id: entry.parcel_id,
      data: { client_event_id: returnEventId },
    });
  }

  return (
    <TableRow>
      <TableCell className="font-mono">{entry.barcode}</TableCell>
      <TableCell>{entry.recipient_name}</TableCell>
      <TableCell>
        <Badge variant={statusStyle.variant} className={statusStyle.className}>
          {t(`warehouseWall.status.${entry.status}`)}
        </Badge>
      </TableCell>
      <TableCell className="max-w-xs text-sm text-muted-foreground">
        {entry.needs ?? "—"}
      </TableCell>
      <TableCell className="text-end">
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <div className="flex justify-end gap-2">
            {canFail && (
              <Button type="button" size="sm" variant="outline" onClick={onFail}>
                <AlertTriangle className="h-3.5 w-3.5" />
                {t("warehouseReturn.actions.recordFailedAttempt")}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant={canReturn ? "default" : "outline"}
              disabled={!canReturn || returnParcel.isPending}
              title={canReturn ? undefined : t("warehouseReturn.returnNotAllowed")}
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

function FailDialog({
  target,
  onClose,
}: {
  target: FailTarget;
  onClose: () => void;
}) {
  const { t, isRTL } = useTranslation();
  const failParcel = useFailParcel();
  const { data: reasonsData, isLoading: isLoadingReasons } = useGetFailureReasons();
  // Minted once, when this dialog opens for this parcel — reused across any
  // retry of the same fail attempt, per the client_event_id contract in
  // useWarehouse.ts.
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<FailParcelData>({
    resolver: zodResolver(failParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      reason_code: "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: FailParcelData) {
    try {
      await failParcel.mutateAsync({ id: target.parcelId, data });
      onClose();
    } catch (err) {
      // useFailParcel's onError already toasts the server message.
      console.error("Fail action failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseReturn.failDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} · <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="reason_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("warehouseReturn.failDialog.reason")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingReasons
                              ? t("warehouseReturn.failDialog.loadingReasons")
                              : t("warehouseReturn.failDialog.reasonPlaceholder")
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reasonsData?.reasons?.map((reason) => (
                        <SelectItem key={reason.reason_code} value={reason.reason_code}>
                          {isRTL ? reason.name_ar : reason.name_en}
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
                  <FormLabel>{t("warehouseReturn.failDialog.notes")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseReturn.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("warehouseReturn.failDialog.submitting")
                  : t("warehouseReturn.failDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
