"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Ban,
  Box,
  Boxes,
  CheckCircle2,
  Clock,
  MessageSquare,
  Package,
  PackageCheck,
  RotateCcw,
  Send,
  Store,
  Truck,
  Undo2,
  User,
  UserCheck,
  XCircle,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { CustomerMessages } from "@/components/parcels/CustomerMessages";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataItem from "@/components/ui/DataItem";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  AssignDialog,
  courierLabel,
  HandoverDialog,
  ReturnedDialog,
  SendToRtoDialog,
} from "@/components/warehouse/WarehouseDialogs";
import {
  HiddenDeliveryCodeNotice,
  MaskedDeliveryCode,
} from "@/components/warehouse/MaskedDeliveryCode";
import { useResolvedWarehouseId } from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { cn } from "@/lib/utils";
import { usePudoNames } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetCouriers,
  useGetParcel,
  useGetParcelEvents,
  useGetWHParcelMessages,
  useResendCode,
  useVoidEvent,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  canEmit,
  SendToRtoData,
  WHEvent,
  WHEventCode,
} from "@/lib/schema/warehouse.schema";

const EVENT_ICON: Record<WHEventCode, React.ElementType> = {
  E01: Package,
  T01: Clock,
  E02: Box,
  E03: UserCheck,
  E04: Truck,
  E05: CheckCircle2,
  E06: XCircle,
  E07: RotateCcw,
  E08: Store,
  E09: PackageCheck,
  S01: Clock,
  R00: Undo2,
  R01: Undo2,
  R02: Undo2,
  D01: Boxes,
  D02: Send,
  X01: Ban,
};

export default function WarehouseParcelDetailPage() {
  const params = useParams();
  const parcelId = (params.id as string) || "";
  const { t, isRTL } = useTranslation();

  const { data: parcelRes, isLoading: parcelLoading, isError: parcelError } =
    useGetParcel(parcelId);
  const { data: eventsRes, isLoading: eventsLoading, isError: eventsError } =
    useGetParcelEvents(parcelId);
  const {
    data: messagesRes,
    isLoading: messagesLoading,
    isError: messagesError,
  } = useGetWHParcelMessages(parcelId);
  // Names for whichever PUDO ids this parcel's status/dialog need — its
  // planned destination, and once handed over, the shop it actually went to.
  // Empty for a warehouse clerk, who may not list PUDOs; ids show bare then.
  const {
    canList: canListPudos,
    branches,
    nameById: pudoNameById,
  } = usePudoNames();

  const [resendOpen, setResendOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [voidTarget, setVoidTarget] = useState<WHEvent | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [rtoOpen, setRtoOpen] = useState(false);
  const [returnedOpen, setReturnedOpen] = useState(false);
  const { warehouseId } = useResolvedWarehouseId();
  const { data: couriersData } = useGetCouriers(warehouseId);
  const couriers = couriersData?.couriers ?? [];

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

  // Same shape as the PUDO parcel page (/parcels/[trackingNumber]): a title
  // row with the actions, then tabs whose sections are rows of "heading on
  // the start side, values on the end side".
  const field = (label: string, value: string) => (
    <DataItem label={label} value={value} />
  );
  const courierName = (() => {
    if (!parcel?.assigned_courier_id) return "—";
    const c = couriers.find((x) => x.user_id === parcel.assigned_courier_id);
    return c ? courierLabel(c) : parcel.assigned_courier_id;
  })();
  const joinAddress = (a?: { line1?: string; district?: string; city?: string } | null) =>
    [a?.line1, a?.district, a?.city].filter(Boolean).join(", ") || "—";

  return (
    <PageContainer size="xl" className="flex flex-col gap-6 py-10">
      {(parcelError || eventsError) && (
        <div className="mx-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseParcel.loadError")}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6 px-6">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : !parcel ? (
        <p className="px-6 text-sm text-muted-foreground">{t("warehouseParcel.notFound")}</p>
      ) : (
        <>
          <div className="flex w-full flex-wrap items-center justify-between gap-4 px-6">
            <div>
              <h1 className="font-mono text-lg font-semibold">{parcel.barcode}</h1>
              <p className="text-sm text-muted-foreground">{parcel.recipient_name}</p>
            </div>
            <Can do={Permission.MANAGE_WAREHOUSE}>
              <div className="flex flex-wrap gap-2">
                {canEmit(parcel.status, "E08") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHandoverOpen(true)}
                  >
                    {t("warehouseParcel.actions.handover")}
                  </Button>
                )}
                {canEmit(parcel.status, "E03") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setAssignOpen(true)}
                  >
                    {t("warehouseParcel.actions.assign")}
                  </Button>
                )}
                {canEmit(parcel.status, "R01") && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setRtoOpen(true)}
                  >
                    {t("warehouseParcel.actions.sendToRto")}
                  </Button>
                )}
                {canEmit(parcel.status, "R02") && (
                  <Button type="button" onClick={() => setReturnedOpen(true)}>
                    {t("warehouseParcel.actions.returned")}
                  </Button>
                )}
                {/* A booked box has no delivery code yet: it is issued when
                    the box is scanned in at Receiving. */}
                {parcel.status !== "not_received" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResendOpen(true)}
                  >
                    {t("warehouseParcel.actions.resendCode")}
                  </Button>
                )}
              </div>
            </Can>
          </div>

          <Tabs defaultValue="info" dir={isRTL ? "rtl" : "ltr"} className="w-full">
            <TabsList className="flex justify-start bg-transparent px-6 gap-2">
              <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px] overflow-x-auto">
                <TabsTrigger value="info">{t("detailPages.tabs.parcelInfo")}</TabsTrigger>
                <TabsTrigger value="tracking">
                  {t("detailPages.tabs.parcelTracking")}
                </TabsTrigger>
                <TabsTrigger value="messages">
                  {t("detailPages.tabs.customerMessages")}
                </TabsTrigger>
              </div>
            </TabsList>

            <TabsContent value="info" className="py-10">
              <div className="flex flex-col gap-6">
                {/* The derived status — the event log's output, never a
                    stored field (docs/warehouse-api.md §1). */}
                <SectionRow
                  title={t("warehouseParcel.derivedStatus.label")}
                  description={t("warehouseParcel.sections.statusDescription")}
                  icon={Package}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col justify-start gap-1">
                      <span className="text-gray-500 text-sm">
                        {t("warehouseParcel.derivedStatus.label")}
                      </span>
                      <WarehouseStatusBadge
                        status={parcel.status}
                        className="w-fit px-3 py-1 text-sm"
                      />
                    </div>
                    {field(t("warehouseParcel.fields.binCode"), parcel.bin_code ?? "—")}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.fields.attemptNumber"),
                      String(parcel.attempt_number),
                    )}
                    {field(t("warehouseParcel.fields.epoch"), String(parcel.epoch))}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.fields.customerInteracted"),
                      parcel.customer_interacted
                        ? t("warehouseParcel.fields.yes")
                        : t("warehouseParcel.fields.no"),
                    )}
                    {parcel.pudo_id != null &&
                      field(
                        t("warehouseParcel.fields.handedToPudo"),
                        pudoNameById.get(parcel.pudo_id) ?? `#${parcel.pudo_id}`,
                      )}
                  </div>
                </SectionRow>

                <SectionRow
                  title={t("warehouseParcel.routing.flowCard")}
                  description={t("warehouseParcel.sections.routingDescription")}
                  icon={Truck}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.routing.flow"),
                      parcel.flow_type
                        ? t(`warehouseParcel.routing.flows.${parcel.flow_type}`)
                        : "—",
                    )}
                    {field(
                      t("warehouseParcel.routing.bucket"),
                      parcel.ucc_bucket
                        ? t(`warehouseParcel.routing.buckets.${parcel.ucc_bucket}`)
                        : "—",
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(t("warehouseParcel.routing.assignedCourier"), courierName)}
                    {field(
                      t("warehouseParcel.routing.failedAttempts"),
                      String(parcel.failed_attempts),
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.routing.retryHold"),
                      parcel.retry_hold ? t("warehouseParcel.routing.held") : "—",
                    )}
                    {field(
                      t("warehouseParcel.routing.returnType"),
                      parcel.return_type
                        ? t(
                            `warehouseQueue.returnTypes.${parcel.return_type as SendToRtoData["return_type"]}`,
                          )
                        : "—",
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {field(
                      t("warehouseParcel.routing.merchant"),
                      parcel.merchant_id != null ? `#${parcel.merchant_id}` : "—",
                    )}
                    {field(
                      t("warehouseParcel.routing.carrier"),
                      parcel.carrier_id != null ? `#${parcel.carrier_id}` : "—",
                    )}
                    {field(
                      t("warehouseParcel.routing.batch"),
                      parcel.batch_id != null ? `#${parcel.batch_id}` : "—",
                    )}
                  </div>
                  {parcel.return_address &&
                    field(
                      t("warehouseParcel.routing.returnAddress"),
                      joinAddress(parcel.return_address),
                    )}
                </SectionRow>

                <SectionRow
                  title={t("warehouseParcel.details.title")}
                  description={t("warehouseParcel.sections.detailsDescription")}
                  icon={User}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <DataItem
                      label={t("warehouseParcel.fields.recipientName")}
                      value={parcel.recipient_name}
                      valueClassName="text-primary"
                    />
                    {field(
                      t("warehouseParcel.fields.recipientPhone"),
                      parcel.recipient_phone,
                    )}
                  </div>
                  {field(t("warehouseParcel.fields.address"), joinAddress(parcel.address))}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.fields.plannedPudo"),
                      parcel.destination_pudo_id != null
                        ? pudoNameById.get(parcel.destination_pudo_id) ??
                            `#${parcel.destination_pudo_id}`
                        : t("warehouseParcel.fields.homeDelivery"),
                    )}
                    {field(
                      t("warehouseParcel.fields.zone"),
                      parcel.zone_id != null ? String(parcel.zone_id) : "—",
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {field(
                      t("warehouseParcel.fields.trackingRef"),
                      parcel.tracking_ref ?? "—",
                    )}
                    {field(t("warehouseParcel.fields.createdAt"), parcel.created_at)}
                  </div>
                  {field(t("warehouseParcel.fields.experimentArm"), parcel.experiment_arm)}
                </SectionRow>
              </div>
            </TabsContent>

            <TabsContent value="tracking" className="py-10">
              <SectionRow
                title={t("warehouseParcel.timeline.title")}
                description={t("warehouseParcel.timeline.subtitle")}
                icon={Clock}
              >
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
                        pudoNameById={pudoNameById}
                      />
                    ))}
                  </ol>
                )}
              </SectionRow>
            </TabsContent>

            <TabsContent value="messages" className="py-10">
              <SectionRow
                title={t("customerMessages.title")}
                description={t("customerMessages.subtitle")}
                icon={MessageSquare}
              >
                <CustomerMessages
                  messages={messagesRes?.messages ?? []}
                  isLoading={messagesLoading}
                  isError={messagesError}
                />
              </SectionRow>
            </TabsContent>
          </Tabs>
        </>
      )}

      {parcel && resendOpen && (
        <ResendCodeDialog
          parcelId={parcel.id}
          barcode={parcel.barcode}
          onClose={() => setResendOpen(false)}
        />
      )}

      {parcel && assignOpen && (
        <AssignDialog
          target={{
            parcelId: parcel.id,
            barcode: parcel.barcode,
            recipientName: parcel.recipient_name,
            assignedCourierId: parcel.assigned_courier_id,
          }}
          couriers={couriers}
          onClose={() => setAssignOpen(false)}
        />
      )}

      {parcel && rtoOpen && (
        <SendToRtoDialog
          target={{
            parcelId: parcel.id,
            barcode: parcel.barcode,
            recipientName: parcel.recipient_name,
            assignedCourierId: parcel.assigned_courier_id,
          }}
          onClose={() => setRtoOpen(false)}
        />
      )}

      {parcel && returnedOpen && (
        <ReturnedDialog
          target={{
            parcelId: parcel.id,
            barcode: parcel.barcode,
            recipientName: parcel.recipient_name,
            assignedCourierId: parcel.assigned_courier_id,
          }}
          onClose={() => setReturnedOpen(false)}
        />
      )}

      {parcel && voidTarget && (
        <VoidEventDialog
          parcelId={parcel.id}
          event={voidTarget}
          onClose={() => setVoidTarget(null)}
        />
      )}

      {parcel && handoverOpen && (
        <HandoverDialog
          parcelId={parcel.id}
          barcode={parcel.barcode}
          destinationPudoId={parcel.destination_pudo_id}
          branches={branches}
          canListPudos={canListPudos}
          pudoNameById={pudoNameById}
          onClose={() => setHandoverOpen(false)}
        />
      )}
    </PageContainer>
  );
}

// One section of the info/tracking/messages tabs, in the PUDO parcel page's
// row style: heading + description on the start side, content on the end side.
function SectionRow({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col sm:flex-row border-0 border-b px-6 rounded-none shadow-none">
      <DataItem isHeading label={title} value={description} icon={icon} />
      <CardContent className="min-w-0 flex-1 space-y-3">{children}</CardContent>
    </Card>
  );
}

function TimelineRow({
  event,
  isLast,
  isVoided,
  onVoid,
  pudoNameById,
}: {
  event: WHEvent;
  isLast: boolean;
  isVoided: boolean;
  onVoid: () => void;
  pudoNameById: Map<number, string>;
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
        {event.pudo_id != null && (
          <p className="text-xs text-muted-foreground">
            {t("warehouseParcel.timeline.pudo")}:{" "}
            {pudoNameById.get(event.pudo_id) ?? `#${event.pudo_id}`}
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
  // The new code lives only here, for as long as this dialog is open — the
  // same show-once, never-store rule as the receiving screen. `done` is
  // separate from the code: a clerk may get the rotation with no code at all
  // (clerk_can_see_delivery_code off).
  const [done, setDone] = useState<{
    code: string | null;
    hidden: boolean;
    messageSent: boolean;
  } | null>(null);
  const [revealed, setRevealed] = useState(false);

  async function handleConfirm() {
    try {
      const data = await resendCode.mutateAsync(parcelId);
      setRevealed(false);
      setDone({
        code: data.delivery_code,
        hidden: !!data.delivery_code_hidden,
        messageSent: data.message_sent,
      });
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

        {done?.code ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t("warehouseParcel.resendDialog.newCode")}
            </p>
            <MaskedDeliveryCode
              code={done.code}
              revealed={revealed}
              onRevealedChange={setRevealed}
            />
          </div>
        ) : done ? (
          <HiddenDeliveryCodeNotice messageSent={done.messageSent} />
        ) : (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{t("warehouseParcel.resendDialog.warning")}</p>
          </div>
        )}

        <DialogFooter>
          {done ? (
            <Button type="button" onClick={onClose}>
              {t("warehouseParcel.resendDialog.done")}
            </Button>
          ) : (
            <>
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
            </>
          )}
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
