"use client";

// Public customer link — NO auth, no app chrome, no navigation. A recipient
// taps this from an SMS/WhatsApp message and has never seen the dashboard.
// See docs/warehouse-api.md §4.3 for the contract. Two hard rules drive
// everything below:
//
// 1. GET is read-only. Link-preview bots (WhatsApp/iMessage/corporate mail
//    scanners) fetch this URL within seconds of the message being sent — if
//    the confirm POST ever fired from a render/effect, a preview would
//    silently confirm the customer's slot for them. The POST only ever runs
//    from the onClick below.
// 2. can_modify: false means the box is already on a van — render the
//    explanation, never a form that would 409 on submit.

import { Suspense, useMemo, useState } from "react";

import { addDays, format, parseISO } from "date-fns";
import { AlertTriangle, CheckCircle2, Package, Truck } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConfirmSlot, useGetSlotPage } from "@/lib/hooks/useSlot";
import { cn } from "@/lib/utils";
import { PublicSlotOption, PublicWHParcel } from "@/lib/schema/slot.schema";
import { WHParcelStatus } from "@/lib/schema/warehouse.schema";
import { ApiError } from "@/lib/services/apiClient";

const STATUS_INFO: Record<
  WHParcelStatus,
  { ar: string; en: string; variant: NonNullable<Parameters<typeof badgeVariants>[0]>["variant"] }
> = {
  not_received: { ar: "لم يتم استلامه بعد", en: "Not received yet", variant: "muted" },
  awaiting_scheduling: {
    ar: "بانتظار اختيارك للموعد",
    en: "Awaiting your time choice",
    variant: "secondary",
  },
  scheduled: { ar: "تم تحديد الموعد", en: "Time scheduled", variant: "success" },
  needs_rebin: {
    ar: "تم تغيير الموعد، جارٍ إعادة الترتيب",
    en: "Rescheduled — being re-sorted",
    variant: "secondary",
  },
  ready_for_dispatch: { ar: "جاهز للتوصيل", en: "Ready for dispatch", variant: "success" },
  out_for_delivery: { ar: "في الطريق إليك الآن", en: "Out for delivery now", variant: "success" },
  attempt_failed: {
    ar: "تعذّر التوصيل في آخر محاولة",
    en: "Last delivery attempt failed",
    variant: "destructive",
  },
  delivered: { ar: "تم التوصيل", en: "Delivered", variant: "success" },
};

function describeError(error: unknown): { ar: string; en: string } {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 400:
        return {
          ar: "هذا الرابط غير صالح أو انتهت صلاحيته. يرجى التواصل مع خدمة العملاء للحصول على رابط جديد.",
          en: "This link is invalid or has expired. Please contact customer support for a new one.",
        };
      case 404:
        return {
          ar: "تعذّر العثور على طرد مرتبط بهذا الرابط. يرجى التواصل مع خدمة العملاء.",
          en: "We couldn't find a parcel for this link. Please contact customer support.",
        };
      case 409:
        return {
          ar: "طردك أصبح بالفعل في الطريق إليك، فلم يعد بالإمكان تغيير الموعد من هنا. تواصل مع خدمة العملاء إن احتجت لتعديله.",
          en: "Your parcel is already out for delivery, so the time can no longer be changed here. Contact customer support if you need to adjust it.",
        };
      case 429:
        return {
          ar: "محاولات كثيرة خلال وقت قصير. يرجى الانتظار قليلًا ثم إعادة المحاولة.",
          en: "Too many attempts in a short time. Please wait a moment and try again.",
        };
      default:
        break;
    }
  }
  return {
    ar: "حدث خطأ غير متوقع. يرجى المحاولة لاحقًا أو التواصل مع خدمة العملاء.",
    en: "Something unexpected went wrong. Please try again later or contact customer support.",
  };
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      dir="rtl"
      lang="ar"
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-4 bg-background px-4 py-6 text-foreground"
    >
      {children}
    </div>
  );
}

function MessageCard({
  icon: Icon,
  ar,
  en,
  tone = "neutral",
}: {
  icon: typeof AlertTriangle;
  ar: string;
  en: string;
  tone?: "neutral" | "destructive" | "success";
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
        <Icon
          className={cn(
            "h-8 w-8",
            tone === "destructive" && "text-destructive",
            tone === "success" && "text-green-600",
            tone === "neutral" && "text-muted-foreground"
          )}
        />
        <p className="text-base font-medium text-foreground">{ar}</p>
        <p className="text-sm text-muted-foreground" dir="ltr" lang="en">
          {en}
        </p>
      </CardContent>
    </Card>
  );
}

function SlotPageSkeleton() {
  return (
    <Shell>
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-64 w-full" />
    </Shell>
  );
}

export default function SlotPage() {
  return (
    <Suspense fallback={<SlotPageSkeleton />}>
      <SlotPageContent />
    </Suspense>
  );
}

function SlotPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { data, isLoading, isError, error, refetch } = useGetSlotPage(token);

  if (!token) {
    return (
      <Shell>
        <MessageCard
          icon={AlertTriangle}
          tone="destructive"
          ar="هذا الرابط غير مكتمل. يرجى فتح الرابط كاملاً من الرسالة التي وصلتك."
          en="This link is incomplete. Please open the full link from the message you received."
        />
      </Shell>
    );
  }

  if (isLoading) return <SlotPageSkeleton />;

  if (isError || !data) {
    const { ar, en } = describeError(error);
    return (
      <Shell>
        <MessageCard icon={AlertTriangle} tone="destructive" ar={ar} en={en} />
      </Shell>
    );
  }

  return (
    <Shell>
      <ParcelHeader parcel={data.parcel} />
      {data.can_modify ? (
        <SlotPicker
          token={token}
          parcel={data.parcel}
          availableSlots={data.available_slots}
          onDispatchedMidFlow={refetch}
        />
      ) : (
        <MessageCard
          icon={Truck}
          tone="neutral"
          ar="طردك أصبح بالفعل في الطريق إليك، لذلك لم يعد بالإمكان تغيير الموعد من هذه الصفحة. لأي استفسار يرجى التواصل مع خدمة العملاء."
          en="Your parcel is already out for delivery, so the time can no longer be changed from this page. Contact customer support with any questions."
        />
      )}
      <p className="mt-auto pt-4 text-center text-xs text-muted-foreground">Zony</p>
    </Shell>
  );
}

function ParcelHeader({ parcel }: { parcel: PublicWHParcel }) {
  const status = STATUS_INFO[parcel.status];
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-5 w-5" />
          <span className="text-sm">{parcel.recipient_name}</span>
        </div>
        <p className="font-mono text-xs text-muted-foreground" dir="ltr">
          {parcel.barcode}
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Badge variant={status.variant}>{status.ar}</Badge>
          <span className="text-xs text-muted-foreground" dir="ltr" lang="en">
            {status.en}
          </span>
        </div>
        {parcel.attempt_number > 0 && (
          <p className="text-xs text-muted-foreground">
            محاولة التوصيل رقم {parcel.attempt_number + 1} ·{" "}
            <span dir="ltr">Delivery attempt {parcel.attempt_number + 1}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

type Selection = { kind: "slot"; slotId: number; date: string } | { kind: "clear" };

// Kept local rather than importing warehouse.hooks's mintClientEventId — this
// page is the one unauthenticated surface in the module and is deliberately
// isolated from the staff/courier domain (see slot.schema.ts).
function mintClientEventId(): string {
  return crypto.randomUUID();
}

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}
function tomorrowStr() {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

function dayLabel(date: string): { ar: string; en: string } {
  if (date === todayStr()) return { ar: "اليوم", en: "Today" };
  if (date === tomorrowStr()) return { ar: "غدًا", en: "Tomorrow" };
  const parsed = parseISO(date);
  return { ar: format(parsed, "d/M"), en: format(parsed, "EEE d/M") };
}

function SlotPicker({
  token,
  parcel,
  availableSlots,
  onDispatchedMidFlow,
}: {
  token: string;
  parcel: PublicWHParcel;
  availableSlots: PublicSlotOption[];
  onDispatchedMidFlow: () => void;
}) {
  const confirmSlot = useConfirmSlot(token);
  const [selection, setSelection] = useState<Selection | null>(null);
  // Minted fresh whenever the user picks a *different* thing, so a resubmit
  // of the exact same tap (after a network error) reuses it — the retry
  // contract in useWarehouse.ts's mintClientEventId, applied the same way
  // here even though /slots is its own domain. A new selection is a new
  // user decision and gets a new id.
  const [clientEventId, setClientEventId] = useState(() => mintClientEventId());
  const [confirmedMessage, setConfirmedMessage] = useState<{ ar: string; en: string } | null>(
    null
  );

  const groups = useMemo(() => {
    const map = new Map<string, PublicSlotOption[]>();
    for (const opt of availableSlots) {
      if (!map.has(opt.date)) map.set(opt.date, []);
      map.get(opt.date)!.push(opt);
    }
    return Array.from(map.entries());
  }, [availableSlots]);

  const currentChoice = parcel.confirmed_slot_id
    ? availableSlots.find((o) => o.slot_id === parcel.confirmed_slot_id)
    : undefined;

  function selectSlot(opt: PublicSlotOption) {
    setConfirmedMessage(null);
    setSelection({ kind: "slot", slotId: opt.slot_id, date: opt.date });
    setClientEventId(mintClientEventId());
  }

  function selectClear() {
    setConfirmedMessage(null);
    setSelection({ kind: "clear" });
    setClientEventId(mintClientEventId());
  }

  async function handleConfirm() {
    if (!selection) return;
    try {
      await confirmSlot.mutateAsync(
        selection.kind === "clear"
          ? { slot_id: null, client_event_id: clientEventId }
          : { slot_id: selection.slotId, date: selection.date, client_event_id: clientEventId }
      );
      setSelection(null);
      setConfirmedMessage(
        selection.kind === "clear"
          ? { ar: "تم إلغاء الموعد المحدد.", en: "Your chosen time was cleared." }
          : { ar: "تم تأكيد موعد التوصيل بنجاح ✅", en: "Delivery time confirmed." }
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        // The box went out for delivery while this page was open — refetch
        // so the view flips to the "already dispatched" explanation instead
        // of leaving a stale form up.
        onDispatchedMidFlow();
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card>
        <CardContent className="flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm text-muted-foreground">موعدك الحالي</p>
            <p className="text-sm text-muted-foreground" dir="ltr" lang="en">
              Current choice
            </p>
          </div>
          {currentChoice ? (
            <div className="text-left">
              <p className="font-semibold">{currentChoice.label_ar}</p>
              <p className="text-xs text-muted-foreground" dir="ltr">
                {currentChoice.starts_at}–{currentChoice.ends_at}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لم يُحدَّد بعد / Not set yet</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-foreground">
          اختر الوقت المناسب لاستلام طردك
          <span className="block text-xs font-normal text-muted-foreground" dir="ltr" lang="en">
            Choose a convenient delivery time
          </span>
        </p>

        {groups.map(([date, options]) => {
          const label = dayLabel(date);
          return (
            <div key={date} className="flex flex-col gap-2">
              <p className="text-xs font-medium text-muted-foreground">
                {label.ar} <span dir="ltr">· {label.en}</span>
              </p>
              <div className="grid grid-cols-2 gap-2">
                {options.map((opt) => {
                  const isSelected =
                    selection?.kind === "slot" &&
                    selection.slotId === opt.slot_id &&
                    selection.date === opt.date;
                  return (
                    <button
                      key={`${opt.slot_id}-${opt.date}`}
                      type="button"
                      onClick={() => selectSlot(opt)}
                      className={cn(
                        "flex flex-col items-center justify-center gap-0.5 rounded-lg border px-2 py-3 text-center transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-input active:bg-accent"
                      )}
                    >
                      <span className="text-sm font-semibold">{opt.label_ar}</span>
                      <span className="text-xs text-muted-foreground" dir="ltr">
                        {opt.starts_at}–{opt.ends_at}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {parcel.confirmed_slot_id !== null && (
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 text-sm",
              selection?.kind === "clear" && "border-primary bg-primary/10"
            )}
            onClick={selectClear}
          >
            إلغاء الموعد المحدد · Clear my chosen time
          </Button>
        )}
      </div>

      {confirmSlot.isError && (
        <MessageCard icon={AlertTriangle} tone="destructive" {...describeError(confirmSlot.error)} />
      )}

      {confirmedMessage && (
        <MessageCard icon={CheckCircle2} tone="success" {...confirmedMessage} />
      )}

      <div className="sticky bottom-0 mt-auto bg-background pb-2 pt-3">
        <Button
          type="button"
          className="h-12 w-full text-base"
          disabled={!selection || confirmSlot.isPending}
          onClick={handleConfirm}
        >
          {confirmSlot.isPending
            ? "جارٍ التأكيد... Confirming..."
            : selection?.kind === "clear"
              ? "تأكيد الإلغاء · Confirm clearing"
              : "تأكيد الموعد · Confirm this time"}
        </Button>
      </div>
    </div>
  );
}
