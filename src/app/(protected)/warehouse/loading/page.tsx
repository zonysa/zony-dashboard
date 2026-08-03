"use client";

import { Suspense, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
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
import { useGetUsers } from "@/lib/hooks/useUsers";
import {
  mintClientEventId,
  useCheckoutParcel,
  useGetLoadingManifest,
  useGetSlots,
  useGetZones,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  checkoutParcelSchema,
  CheckoutParcelData,
  WHParcelStatus,
  WHWallEntry,
} from "@/lib/schema/warehouse.schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
// Couriers are role_id 6 in the legacy numeric role system the /users
// endpoint still filters on — see src/app/(protected)/courier/page.tsx for
// the same filter used by the admin-facing courier CRUD list.
const COURIER_ROLE_ID = 6;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

// E04 (checkout) is legal only from ready_for_dispatch — see
// docs/warehouse-api.md §2's transition table. That status already encodes
// "customer confirmed a slot AND the box was binned into that same slot";
// disable the action everywhere else rather than letting the server 409.
const CHECKOUTABLE_STATUSES = new Set<WHParcelStatus>(["ready_for_dispatch"]);

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

type CheckoutTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
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

  const { data: slotsData } = useGetSlots();
  const { data: zonesData } = useGetZones();
  const slots = useMemo(() => slotsData?.slots ?? [], [slotsData?.slots]);
  const zoneNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const zone of zonesData?.zones ?? []) map.set(zone.id, zone.name);
    return map;
  }, [zonesData?.zones]);

  const slotId = slotIdParam && slots.some((s) => String(s.id) === slotIdParam) ? slotIdParam : "";

  const { data, isLoading, isError } = useGetLoadingManifest(slotId, date);

  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(null);

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
          <h1 className="text-xl font-semibold text-foreground">{t("warehouseLoading.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("warehouseLoading.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-56">
            <Select value={slotId || undefined} onValueChange={handleSlotSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("warehouseLoading.slotPlaceholder")} />
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
          <Badge variant="secondary">{data?.count ?? 0}</Badge>
        </CardHeader>
        <CardContent>
          {!slotId ? (
            <p className="text-sm text-muted-foreground">{t("warehouseLoading.manifest.pickSlot")}</p>
          ) : isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !data?.parcels?.length ? (
            <p className="text-sm text-muted-foreground">{t("warehouseLoading.manifest.empty")}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseLoading.table.barcode")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.recipient")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.zone")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.status")}</TableHead>
                  <TableHead>{t("warehouseLoading.table.bin")}</TableHead>
                  <TableHead className="text-end">{t("warehouseLoading.table.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.parcels.map((entry) => (
                  <ManifestRow
                    key={entry.parcel_id}
                    entry={entry}
                    zoneName={entry.zone_id ? zoneNameById.get(entry.zone_id) : undefined}
                    onCheckout={() =>
                      setCheckoutTarget({
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

      {checkoutTarget && (
        <CheckoutDialog target={checkoutTarget} onClose={() => setCheckoutTarget(null)} />
      )}
    </PageContainer>
  );
}

function ManifestRow({
  entry,
  zoneName,
  onCheckout,
}: {
  entry: WHWallEntry;
  zoneName?: string;
  onCheckout: () => void;
}) {
  const { t } = useTranslation();
  const checkoutable = CHECKOUTABLE_STATUSES.has(entry.status);
  const statusStyle = STATUS_BADGE[entry.status];

  return (
    <TableRow>
      <TableCell className="font-mono">{entry.barcode}</TableCell>
      <TableCell>{entry.recipient_name}</TableCell>
      <TableCell>{zoneName ?? "—"}</TableCell>
      <TableCell>
        <Badge variant={statusStyle.variant} className={statusStyle.className}>
          {t(`warehouseWall.status.${entry.status}`)}
        </Badge>
      </TableCell>
      <TableCell className="font-mono text-muted-foreground">{entry.bin_code ?? "—"}</TableCell>
      <TableCell className="text-end">
        <Can do={Permission.MANAGE_WAREHOUSE}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!checkoutable}
            title={checkoutable ? undefined : t("warehouseLoading.checkoutNotAllowed")}
            onClick={onCheckout}
          >
            {t("warehouseLoading.actions.checkout")}
          </Button>
        </Can>
      </TableCell>
    </TableRow>
  );
}

function CheckoutDialog({
  target,
  onClose,
}: {
  target: CheckoutTarget;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const checkoutParcel = useCheckoutParcel();
  // Minted once, when this dialog opens for this parcel — reused across any
  // retry of the same checkout attempt, per the client_event_id contract in
  // useWarehouse.ts.
  const [clientEventId] = useState(() => mintClientEventId());

  const { data: couriersData, isLoading: isLoadingCouriers } = useGetUsers({
    role_id: COURIER_ROLE_ID,
    is_active: true,
    limit: 100,
  });

  const form = useForm<CheckoutParcelData>({
    resolver: zodResolver(checkoutParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      courier_id: "",
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
      await checkoutParcel.mutateAsync({ id: target.parcelId, data });
      onClose();
    } catch (err) {
      // useCheckoutParcel's onError already toasts the server message (e.g.
      // a 409 if the status changed between page load and submit).
      console.error("Checkout failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseLoading.checkoutDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} · <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="courier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("warehouseLoading.checkoutDialog.courier")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            isLoadingCouriers
                              ? t("warehouseLoading.checkoutDialog.loadingCouriers")
                              : t("warehouseLoading.checkoutDialog.courierPlaceholder")
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {couriersData?.users?.map((courier) => (
                        <SelectItem key={courier.id} value={courier.id}>
                          {courier.first_name} {courier.last_name}
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
                  <FormLabel>{t("warehouseLoading.checkoutDialog.notes")}</FormLabel>
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
