"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Box,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RotateCcw,
  Truck,
  XCircle,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetParcel,
  useGetParcelEvents,
  useResendCode,
  useVoidEvent,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { WHEvent, WHEventCode, WHParcelStatus } from "@/lib/schema/warehouse.schema";

// Same convention as the other warehouse screens (Wall, Return desk): each
// page keeps its own copy of this map rather than sharing one.
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

const EVENT_ICON: Record<WHEventCode, React.ElementType> = {
  E01: Package,
  T01: Clock,
  E02: Box,
  E04: Truck,
  E05: CheckCircle2,
  E06: XCircle,
  E07: RotateCcw,
  X01: Ban,
};

export default function WarehouseParcelDetailPage() {
  const params = useParams();
  const parcelId = (params.id as string) || "";
  const { t } = useTranslation();

  const { data: parcelRes, isLoading: parcelLoading, isError: parcelError } =
    useGetParcel(parcelId);
  const { data: eventsRes, isLoading: eventsLoading, isError: eventsError } =
    useGetParcelEvents(parcelId);

  const [resendOpen, setResendOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<WHEvent | null>(null);

  if (!parcelId) {
    notFound();
  }

  const parcel = parcelRes?.parcel;
  const events = eventsRes?.events ?? [];

  // Which event ids are already voided, so the void action can be hidden for
  // them (voiding a void is meaningless) and the row can be struck through.
  const voidedEventIds = new Set(
    events.filter((e) => e.code === "X01" && e.voids_event_id != null).map((e) => e.voids_event_id),
  );

  const isLoading = parcelLoading || eventsLoading;

  return (
    <PageContainer size="lg" className="px-6 py-10">
      {(parcelError || eventsError) && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseParcel.loadError")}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !parcel ? (
        <p className="text-sm text-muted-foreground">{t("warehouseParcel.notFound")}</p>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-mono text-xl font-semibold text-foreground">
                {parcel.barcode}
              </h1>
              <p className="text-sm text-muted-foreground">{parcel.recipient_name}</p>
            </div>
            <Can do={Permission.MANAGE_WAREHOUSE}>
              <Button type="button" variant="outline" onClick={() => setResendOpen(true)}>
                {t("warehouseParcel.actions.resendCode")}
              </Button>
            </Can>
          </div>

          {/* The derived status, framed as the fold's output — not a stored
              field. It's rendered above the log but explicitly described as
              coming from it, per docs/warehouse-api.md §1: "never cache a
              status and never compute one client-side." */}
          <Card className="border-2">
            <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
              <div>
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  {t("warehouseParcel.derivedStatus.label")}
                </p>
                <div className="mt-1">
                  <Badge
                    className={cn("px-3 py-1 text-sm", STATUS_BADGE[parcel.status].className)}
                    variant={STATUS_BADGE[parcel.status].variant}
                  >
                    {t(`warehouseWall.status.${parcel.status}`)}
                  </Badge>
                </div>
              </div>
              <p className="max-w-sm text-xs text-muted-foreground">
                {t("warehouseParcel.derivedStatus.explanation")}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-4">
                <InfoStat label={t("warehouseParcel.fields.epoch")} value={String(parcel.epoch)} />
                <InfoStat
                  label={t("warehouseParcel.fields.attemptNumber")}
                  value={String(parcel.attempt_number)}
                />
                <InfoStat
                  label={t("warehouseParcel.fields.binCode")}
                  value={parcel.bin_code ?? "—"}
                />
                <InfoStat
                  label={t("warehouseParcel.fields.customerInteracted")}
                  value={
                    parcel.customer_interacted
                      ? t("warehouseParcel.fields.yes")
                      : t("warehouseParcel.fields.no")
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseParcel.details.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoStat
                label={t("warehouseParcel.fields.recipientPhone")}
                value={parcel.recipient_phone}
              />
              <InfoStat
                label={t("warehouseParcel.fields.trackingRef")}
                value={parcel.tracking_ref ?? "—"}
              />
              <InfoStat
                label={t("warehouseParcel.fields.zone")}
                value={parcel.zone_id != null ? String(parcel.zone_id) : "—"}
              />
              <InfoStat
                label={t("warehouseParcel.fields.experimentArm")}
                value={parcel.experiment_arm}
              />
              <InfoStat
                label={t("warehouseParcel.fields.createdAt")}
                value={parcel.created_at}
              />
              <div className="flex items-start gap-2 sm:col-span-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <InfoStat
                  label={t("warehouseParcel.fields.address")}
                  value={
                    [parcel.address.line1, parcel.address.district, parcel.address.city]
                      .filter(Boolean)
                      .join(", ") || "—"
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("warehouseParcel.timeline.title")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("warehouseParcel.timeline.subtitle")}
              </p>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {t("warehouseParcel.timeline.empty")}
                </p>
              ) : (
                <ol className="space-y-0">
                  {events.map((event, idx) => (
                    <TimelineRow
                      key={event.id}
                      event={event}
                      isLast={idx === events.length - 1}
                      isVoided={voidedEventIds.has(event.id)}
                      onVoid={() => setVoidTarget(event)}
                    />
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {parcel && resendOpen && (
        <ResendCodeDialog
          parcelId={parcel.id}
          barcode={parcel.barcode}
          onClose={() => setResendOpen(false)}
        />
      )}

      {parcel && voidTarget && (
        <VoidEventDialog
          parcelId={parcel.id}
          event={voidTarget}
          onClose={() => setVoidTarget(null)}
        />
      )}
    </PageContainer>
  );
}

function InfoStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function TimelineRow({
  event,
  isLast,
  isVoided,
  onVoid,
}: {
  event: WHEvent;
  isLast: boolean;
  isVoided: boolean;
  onVoid: () => void;
}) {
  const { t } = useTranslation();
  const Icon = EVENT_ICON[event.code];
  // X01 can't itself be voided, and an event that's already been voided
  // can't be voided again — the void action only makes sense once per event.
  const canOfferVoid = event.code !== "X01" && !isVoided;

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute top-7 bottom-0 start-[15px] w-px bg-border" aria-hidden />
      )}
      <span
        className={cn(
          "z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
          event.code === "X01"
            ? "border-destructive/40 bg-destructive/10 text-destructive"
            : "border-border bg-muted text-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className={cn("flex-1 space-y-1", isVoided && "opacity-60")}>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-sm font-medium",
              isVoided && "text-muted-foreground line-through",
            )}
          >
            {t(`warehouseParcel.eventCodes.${event.code}`)}
          </span>
          <Badge variant="muted" className="font-mono text-[10px]">
            {event.code}
          </Badge>
          {isVoided && (
            <Badge variant="destructive" className="text-[10px]">
              {t("warehouseParcel.timeline.voided")}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{event.occurred_at}</span>
        </div>

        <p className={cn("text-xs text-muted-foreground", isVoided && "line-through")}>
          {t(`warehouseParcel.eventDescriptions.${event.code}`)}
        </p>

        {event.slot_id != null && (
          <p className="text-xs text-muted-foreground">
            {t("warehouseParcel.timeline.slot")}: {event.slot_id}
          </p>
        )}
        {event.reason_code && (
          <p className="text-xs text-muted-foreground">
            {t("warehouseParcel.timeline.reasonCode")}: {event.reason_code}
          </p>
        )}
        {event.code === "X01" && event.voids_event_id != null && (
          <p className="text-xs text-muted-foreground">
            {t("warehouseParcel.timeline.voidsEvent")}: #{event.voids_event_id}
          </p>
        )}
        {event.notes && (
          <p className="text-xs text-muted-foreground italic">
            {event.code === "X01"
              ? t("warehouseParcel.timeline.voidReason")
              : t("warehouseParcel.timeline.notes")}
            : {event.notes}
          </p>
        )}

        {canOfferVoid && (
          <Can do={Permission.VOID_WAREHOUSE_EVENTS}>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onVoid}
            >
              <Ban className="h-3 w-3" />
              {t("warehouseParcel.actions.void")}
            </Button>
          </Can>
        )}
      </div>
    </li>
  );
}

function ResendCodeDialog({
  parcelId,
  barcode,
  onClose,
}: {
  parcelId: string;
  barcode: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const resendCode = useResendCode();

  async function handleConfirm() {
    try {
      await resendCode.mutateAsync({ id: parcelId, clientEventId: mintClientEventId() });
      onClose();
    } catch (err) {
      // useResendCode's onError already toasts the server message.
      console.error("Resend code failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseParcel.resendDialog.title")}</DialogTitle>
          <DialogDescription>
            <span className="font-mono">{barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("warehouseParcel.resendDialog.warning")}</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("warehouseParcel.actions.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={resendCode.isPending}
            onClick={handleConfirm}
          >
            {resendCode.isPending
              ? t("warehouseParcel.resendDialog.submitting")
              : t("warehouseParcel.resendDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function VoidEventDialog({
  parcelId,
  event,
  onClose,
}: {
  parcelId: string;
  event: WHEvent;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const voidEvent = useVoidEvent();
  const [reason, setReason] = useState("");
  const [clientEventId] = useState(() => mintClientEventId());

  const isValid = reason.trim().length > 0;

  async function handleSubmit() {
    if (!isValid) return;
    try {
      await voidEvent.mutateAsync({
        id: parcelId,
        data: {
          client_event_id: clientEventId,
          voids_event_id: event.id,
          void_reason: reason.trim(),
        },
      });
      onClose();
    } catch (err) {
      // useVoidEvent's onError already toasts the server message.
      console.error("Void event failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseParcel.voidDialog.title")}</DialogTitle>
          <DialogDescription>
            {t(`warehouseParcel.eventCodes.${event.code}`)} · {event.occurred_at}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{t("warehouseParcel.voidDialog.onlyCorrectionWarning")}</p>
        </div>

        <div className="space-y-2">
          <Label>{t("warehouseParcel.voidDialog.reasonLabel")}</Label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder={t("warehouseParcel.voidDialog.reasonPlaceholder")}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("warehouseParcel.actions.cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={!isValid || voidEvent.isPending}
            onClick={handleSubmit}
          >
            <Ban className="h-3.5 w-3.5" />
            {voidEvent.isPending
              ? t("warehouseParcel.voidDialog.submitting")
              : t("warehouseParcel.voidDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
