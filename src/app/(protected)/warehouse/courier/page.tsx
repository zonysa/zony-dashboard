"use client";

import { FormEvent, Suspense, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Package,
  Phone,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useCourierCheckoutParcel,
  useCourierDeliverParcel,
  useCourierFailParcel,
  useCourierReturnParcel,
  useGetCourierFailureReasons,
  useGetCourierManifest,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { ApiError } from "@/lib/services/apiClient";
import {
  deliverParcelSchema,
  DeliverParcelData,
  WHCourierManifestEntry,
  WHParcelStatus,
} from "@/lib/schema/warehouse.schema";
import { useAuthStore } from "@/lib/stores/auth-store";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// docs/warehouse-api.md §3: E05 (deliver) is throttled at 5 wrong codes per
// 15 minutes before the server starts returning 429. There's no
// attempts-remaining field in the response, so this is a client-side
// estimate that resets whenever the dialog is reopened — informational only,
// the server remains the enforcer.
const MAX_CODE_ATTEMPTS = 5;

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

// Transition table (docs/warehouse-api.md §2), restricted to the four
// statuses a courier's own manifest can show and the actions legal from
// each — disable a button rather than let it 409.
const CAN_CHECKOUT = new Set<WHParcelStatus>(["ready_for_dispatch"]);
const CAN_ACT_ON_DELIVERY = new Set<WHParcelStatus>(["out_for_delivery"]);
const CAN_RETURN = new Set<WHParcelStatus>(["attempt_failed"]);

// Surfaces the parcels that still need a courier's attention before the
// ones already resolved — the manifest isn't sorted server-side.
const STATUS_PRIORITY: Record<WHParcelStatus, number> = {
  out_for_delivery: 0,
  attempt_failed: 1,
  ready_for_dispatch: 2,
  needs_rebin: 3,
  scheduled: 3,
  awaiting_scheduling: 3,
  not_received: 3,
  delivered: 4,
};

const STATUS_BADGE: Partial<
  Record<
    WHParcelStatus,
    { variant: NonNullable<Parameters<typeof badgeVariants>[0]>["variant"] }
  >
> = {
  ready_for_dispatch: { variant: "success" },
  out_for_delivery: { variant: "default" },
  attempt_failed: { variant: "destructive" },
  delivered: { variant: "success" },
};

export default function CourierPage() {
  return (
    <Suspense fallback={<CourierSkeleton />}>
      <CourierPageContent />
    </Suspense>
  );
}

function CourierSkeleton() {
  return (
    <PageContainer size="sm" className="px-4 py-6">
      <Skeleton className="mb-4 h-24 w-full" />
      <Skeleton className="h-32 w-full" />
    </PageContainer>
  );
}

function CourierPageContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const courierId = useAuthStore((s) => s.user?.id);

  const dateParam = searchParams.get("date");
  const date = dateParam && DATE_RE.test(dateParam) ? dateParam : todayStr();
  const slotId = searchParams.get("slot_id") ?? "";
  const [slotInput, setSlotInput] = useState(slotId);

  const { data, isLoading, isError } = useGetCourierManifest(slotId, date);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleSlotSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = slotInput.trim();
    if (trimmed) updateParam("slot_id", trimmed);
  }

  function handleDateSelect(newDate: Date | undefined) {
    if (!newDate) return;
    updateParam("date", format(newDate, "yyyy-MM-dd"));
  }

  const parcels = [...(data?.parcels ?? [])].sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
  );

  return (
    <PageContainer size="sm" className="px-4 py-6 sm:px-6">
      <h1 className="mb-4 text-lg font-semibold text-foreground">
        {t("warehouseCourier.title")}
      </h1>

      <div className="mb-5 flex flex-col gap-2">
        <form onSubmit={handleSlotSubmit} className="flex gap-2">
          <Input
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={t("warehouseCourier.slotPlaceholder")}
            value={slotInput}
            onChange={(e) => setSlotInput(e.target.value)}
            className="h-12 text-base"
          />
          <Button type="submit" className="h-12 px-5 text-base">
            {t("warehouseCourier.loadManifest")}
          </Button>
        </form>
        <div className="[&_button]:h-12 [&_button]:text-base">
          <DatePicker
            date={parse(date, "yyyy-MM-dd", new Date())}
            onSelect={handleDateSelect}
            placeholder={t("warehouseCourier.datePickerPlaceholder")}
          />
        </div>
      </div>

      {isError && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseCourier.loadError")}
        </div>
      )}

      {!slotId ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("warehouseCourier.pickSlot")}
        </p>
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : !parcels.length ? (
        <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t("warehouseCourier.empty")}
        </p>
      ) : (
        <div className="space-y-3">
          {parcels.map((entry) => (
            <ParcelCard key={entry.parcel_id} entry={entry} courierId={courierId} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}

function ParcelCard({
  entry,
  courierId,
}: {
  entry: WHCourierManifestEntry;
  courierId?: string;
}) {
  const { t } = useTranslation();
  const [deliverOpen, setDeliverOpen] = useState(false);
  const [failOpen, setFailOpen] = useState(false);

  const checkoutParcel = useCourierCheckoutParcel();
  const returnParcel = useCourierReturnParcel();
  // Minted once per card mount and reused for every retry of that same tap
  // (the card only leaves the manifest, or changes status, once the event
  // actually lands) — see the client_event_id contract in useWarehouse.ts.
  const [checkoutEventId] = useState(() => mintClientEventId());
  const [returnEventId] = useState(() => mintClientEventId());

  const canCheckout = CAN_CHECKOUT.has(entry.status);
  const canActOnDelivery = CAN_ACT_ON_DELIVERY.has(entry.status);
  const canReturn = CAN_RETURN.has(entry.status);
  const badgeStyle = STATUS_BADGE[entry.status];

  function handleCheckout() {
    if (!courierId) return;
    checkoutParcel.mutate({
      id: entry.parcel_id,
      data: { client_event_id: checkoutEventId, courier_id: courierId },
    });
  }

  function handleReturn() {
    returnParcel.mutate({
      id: entry.parcel_id,
      data: { client_event_id: returnEventId },
    });
  }

  const addressLine = [entry.address.line1, entry.address.district]
    .filter(Boolean)
    .join(", ");

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-base font-semibold text-foreground">
              {entry.recipient_name}
            </p>
            <p className="font-mono text-xs text-muted-foreground">{entry.barcode}</p>
            {addressLine && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{addressLine}</p>
            )}
          </div>
          {badgeStyle && (
            <Badge variant={badgeStyle.variant} className="shrink-0">
              {t(`warehouseWall.status.${entry.status}`)}
            </Badge>
          )}
        </div>

        <a
          href={`tel:${entry.recipient_phone}`}
          className="flex h-12 items-center gap-2 rounded-md border border-input px-3 text-base font-medium text-primary active:bg-accent"
        >
          <Phone className="h-5 w-5 shrink-0" />
          {entry.recipient_phone}
        </a>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {entry.bin_code && (
            <span>
              {t("warehouseCourier.bin")}: <span className="font-mono">{entry.bin_code}</span>
            </span>
          )}
          {entry.attempt_number > 0 && (
            <span>{t("warehouseCourier.attempt", { count: entry.attempt_number + 1 })}</span>
          )}
        </div>

        <Can do={Permission.MANAGE_WAREHOUSE_COURIER}>
          <div className="flex flex-col gap-2 pt-1">
            {canCheckout && (
              <Button
                type="button"
                className="h-12 text-base"
                disabled={checkoutParcel.isPending || !courierId}
                title={courierId ? undefined : t("warehouseCourier.checkoutMissingCourier")}
                onClick={handleCheckout}
              >
                <Package className="h-5 w-5" />
                {t("warehouseCourier.actions.checkout")}
              </Button>
            )}
            {canActOnDelivery && (
              <>
                <Button
                  type="button"
                  className="h-12 text-base"
                  onClick={() => setDeliverOpen(true)}
                >
                  <CheckCircle2 className="h-5 w-5" />
                  {t("warehouseCourier.actions.deliver")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 text-base"
                  onClick={() => setFailOpen(true)}
                >
                  <AlertTriangle className="h-5 w-5" />
                  {t("warehouseCourier.actions.reportFailed")}
                </Button>
              </>
            )}
            {canReturn && (
              <Button
                type="button"
                className="h-12 text-base"
                disabled={returnParcel.isPending}
                onClick={handleReturn}
              >
                <ArrowRight className="h-5 w-5" />
                {t("warehouseCourier.actions.returnToWarehouse")}
              </Button>
            )}
            {entry.status === "delivered" && (
              <p className="text-center text-sm text-muted-foreground">
                {t("warehouseCourier.delivered")}
              </p>
            )}
          </div>
        </Can>
      </CardContent>

      {deliverOpen && <DeliverDialog entry={entry} onClose={() => setDeliverOpen(false)} />}
      {failOpen && <FailDialog entry={entry} onClose={() => setFailOpen(false)} />}
    </Card>
  );
}

function DeliverDialog({
  entry,
  onClose,
}: {
  entry: WHCourierManifestEntry;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const deliverParcel = useCourierDeliverParcel();
  // Minted once when this dialog opens and reused across retries — including
  // a retry with a corrected code, matching the same one-client_event_id-
  // per-dialog convention used by the staff checkout/fail dialogs.
  const [clientEventId] = useState(() => mintClientEventId());
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const attemptsRemaining = Math.max(MAX_CODE_ATTEMPTS - attemptsUsed, 0);

  const form = useForm<DeliverParcelData>({
    resolver: zodResolver(deliverParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      delivery_code: "",
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: DeliverParcelData) {
    try {
      await deliverParcel.mutateAsync({ id: entry.parcel_id, data });
      onClose();
    } catch (err) {
      // useCourierDeliverParcel's onError already toasts the server's
      // message — a wrong code (403) or a throttle lockout (429) both come
      // through with customer/courier-facing wording from the backend.
      if (err instanceof ApiError) {
        if (err.status === 403) {
          setAttemptsUsed((n) => n + 1);
          setValue("delivery_code", "");
        } else if (err.status === 429) {
          setLockedOut(true);
        }
      }
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("warehouseCourier.deliverDialog.title")}</DialogTitle>
          <DialogDescription>
            {entry.recipient_name} · <span className="font-mono">{entry.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        {lockedOut ? (
          <>
            <p className="rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              {t("warehouseCourier.deliverDialog.lockedOut")}
            </p>
            <Button type="button" className="h-12 w-full text-base" onClick={onClose}>
              {t("warehouseCourier.actions.cancel")}
            </Button>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("warehouseCourier.deliverDialog.askCustomer")}
              </p>

              <FormField
                control={control}
                name="delivery_code"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormControl>
                      <InputOTP
                        maxLength={4}
                        inputMode="numeric"
                        value={field.value}
                        onChange={field.onChange}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} className="h-14 w-12 text-xl" />
                          <InputOTPSlot index={1} className="h-14 w-12 text-xl" />
                          <InputOTPSlot index={2} className="h-14 w-12 text-xl" />
                          <InputOTPSlot index={3} className="h-14 w-12 text-xl" />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p
                className={cn(
                  "text-center text-sm",
                  attemptsRemaining <= 2 ? "text-destructive" : "text-muted-foreground"
                )}
              >
                {t("warehouseCourier.deliverDialog.attemptsRemaining", {
                  count: attemptsRemaining,
                })}
              </p>

              <DialogFooter className="flex-col gap-2 sm:flex-col">
                <Button
                  type="submit"
                  className="h-12 w-full text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? t("warehouseCourier.deliverDialog.submitting")
                    : t("warehouseCourier.deliverDialog.submit")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-full text-base"
                  onClick={onClose}
                >
                  {t("warehouseCourier.actions.cancel")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FailDialog({
  entry,
  onClose,
}: {
  entry: WHCourierManifestEntry;
  onClose: () => void;
}) {
  const { t, isRTL } = useTranslation();
  const failParcel = useCourierFailParcel();
  const { data: reasonsData, isLoading } = useGetCourierFailureReasons();
  // Minted once when this dialog opens — see the client_event_id contract in
  // useWarehouse.ts. Reason selection is a single tap, so this is the id for
  // whichever reason the courier ends up tapping.
  const [clientEventId] = useState(() => mintClientEventId());

  async function handleSelect(reasonCode: string) {
    try {
      await failParcel.mutateAsync({
        id: entry.parcel_id,
        data: { client_event_id: clientEventId, reason_code: reasonCode },
      });
      onClose();
    } catch (err) {
      // useCourierFailParcel's onError already toasts the server message.
      console.error("Fail action failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("warehouseCourier.failDialog.title")}</DialogTitle>
          <DialogDescription>
            {entry.recipient_name} · <span className="font-mono">{entry.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="flex flex-col gap-2">
            {reasonsData?.reasons?.map((reason) => (
              <Button
                key={reason.reason_code}
                type="button"
                variant="outline"
                className="h-14 justify-start text-base"
                disabled={failParcel.isPending}
                onClick={() => handleSelect(reason.reason_code)}
              >
                {isRTL ? reason.name_ar : reason.name_en}
              </Button>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="ghost"
          className="h-12 w-full text-base"
          disabled={failParcel.isPending}
          onClick={onClose}
        >
          {t("warehouseCourier.actions.cancel")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
