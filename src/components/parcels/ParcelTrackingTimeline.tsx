"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  RotateCcw,
  Store,
  Truck,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ParcelTrackingEvent } from "@/lib/schema/parcel.schema";

// Icons for the backend's actual Parcel.status values (see
// ParcelUpdateSchema/ParcelPolicy on the backend — not the same set as the
// frontend's own ParcelDetails["status"] union, which is stale). Tracking
// codes the backend may add later fall back to Package rather than throwing
// on a missing key.
const EVENT_ICON: Record<string, React.ElementType> = {
  pending: Package,
  courier_received: Truck,
  waiting_confirmation: Clock,
  PUDO_received: Store,
  customer_received: CheckCircle2,
  expired: AlertTriangle,
  expired_received: RotateCcw,
};

interface ParcelTrackingTimelineProps {
  events: ParcelTrackingEvent[];
  isLoading?: boolean;
  isError?: boolean;
}

export function ParcelTrackingTimeline({
  events,
  isLoading,
  isError,
}: ParcelTrackingTimelineProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-sm text-destructive">
        {t("parcelTracking.loadError")}
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("parcelTracking.empty")}
      </p>
    );
  }

  return (
    <ol className="space-y-0">
      {events.map((event, idx) => (
        <TimelineRow
          key={event.id}
          event={event}
          isLast={idx === events.length - 1}
        />
      ))}
    </ol>
  );
}

function TimelineRow({
  event,
  isLast,
}: {
  event: ParcelTrackingEvent;
  isLast: boolean;
}) {
  const { t } = useTranslation();
  const Icon = EVENT_ICON[event.code] || Package;
  const description = t(`parcelTracking.eventDescriptions.${event.code}`, "");

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute top-7 bottom-0 start-[15px] w-px bg-border" aria-hidden />
      )}
      <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-foreground">
        <Icon className="h-4 w-4" />
      </span>

      <div className="flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">
            {t(`parcelTracking.eventCodes.${event.code}`, event.code.replace(/_/g, " "))}
          </span>
          <span className="text-xs text-muted-foreground">{event.occurred_at}</span>
        </div>

        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {event.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {event.location}
          </p>
        )}
        {event.notes && (
          <p className="text-xs text-muted-foreground italic">
            {t("parcelTracking.notes")}: {event.notes}
          </p>
        )}
      </div>
    </li>
  );
}
