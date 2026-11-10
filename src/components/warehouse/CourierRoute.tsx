"use client";

import { useState } from "react";
import { Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetCourierPlaces } from "@/lib/hooks/useWarehouse";
import {
  CourierStop,
  CourierStopAction,
  CourierStopParcel,
} from "@/lib/schema/warehouse.schema";

// The courier's whole day, as their app shows it: every stop across both
// parcel flows and every warehouse, grouped by place. Read-only; the actions
// table below it is where staff record steps.

type Direction = "all" | CourierStopAction;

// PUDO-flow statuses a stop can carry (see the backend's courier_places.py).
type PudoFlowStatus =
  "pending" | "courier_received" | "expired" | "expired_received";
const PUDO_FLOW_STATUSES: readonly string[] = [
  "pending",
  "courier_received",
  "expired",
  "expired_received",
];

export function CourierRoute({ courierId }: { courierId: string }) {
  const { t } = useTranslation();
  const [direction, setDirection] = useState<Direction>("all");
  const { data, isLoading, isError } = useGetCourierPlaces(
    courierId,
    direction === "all" ? undefined : direction,
  );

  const stops = data?.stops ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            {t("warehouseCourierActions.route.title")}
            <Badge variant="secondary">{data?.total_stops ?? 0}</Badge>
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("warehouseCourierActions.route.hint")}
          </p>
        </div>
        <Tabs
          value={direction}
          onValueChange={(v) => setDirection(v as Direction)}
        >
          <TabsList>
            <TabsTrigger value="all">
              {t("warehouseCourierActions.route.direction.all")}
            </TabsTrigger>
            <TabsTrigger value="pickup">
              {t("warehouseCourierActions.route.direction.pickup")}
            </TabsTrigger>
            <TabsTrigger value="deliver">
              {t("warehouseCourierActions.route.direction.deliver")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="text-sm text-destructive">
            {t("warehouseCourierActions.route.loadError")}
          </p>
        ) : isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : !stops.length ? (
          <p className="text-sm text-muted-foreground">
            {t("warehouseCourierActions.route.empty")}
          </p>
        ) : (
          <ol className="space-y-3">
            {stops.map((stop, i) => (
              <StopRow
                key={`${stop.action}-${stop.place_type}-${i}`}
                stop={stop}
                index={i + 1}
              />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}

function StopRow({ stop, index }: { stop: CourierStop; index: number }) {
  const { t } = useTranslation();
  const place = stop.place;
  const win = stop.window;
  const coords = place?.coordinates;

  return (
    <li className="flex gap-3 rounded-lg border p-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
        {index}
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={stop.action === "pickup" ? "secondary" : "default"}>
            {t(`warehouseCourierActions.route.direction.${stop.action}`)}
          </Badge>
          <Badge variant="outline">
            {t(`warehouseCourierActions.route.placeType.${stop.place_type}`)}
          </Badge>
          <span className="font-medium">
            {place?.name ?? t("warehouseCourierActions.route.noPlace")}
          </span>
        </div>

        {place && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {place.address && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {coords ? (
                  <a
                    href={`https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline-offset-2 hover:underline"
                  >
                    {place.address}
                  </a>
                ) : (
                  place.address
                )}
              </span>
            )}
            {place.phone_number && (
              <a
                href={`tel:${place.phone_number}`}
                className="flex items-center gap-1 underline-offset-2 hover:underline"
                dir="ltr"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                {place.phone_number}
              </a>
            )}
            {win && (
              <span className="flex items-center gap-1" dir="ltr">
                <Clock className="h-3.5 w-3.5 shrink-0" />
                {[win.date ?? win.slot_code, windowTimes(win)]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {stop.parcels.map((p) => (
            <ParcelChip key={`${p.source}-${p.id}`} parcel={p} />
          ))}
        </div>
      </div>
    </li>
  );
}

function windowTimes(w: { from_time: string | null; to_time: string | null }) {
  if (!w.from_time && !w.to_time) return null;
  return `${w.from_time ?? "?"}–${w.to_time ?? "?"}`;
}

function ParcelChip({ parcel: p }: { parcel: CourierStopParcel }) {
  const { t } = useTranslation();

  if (p.source === "warehouse") {
    return (
      <span className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
        <Link
          href={`/warehouse/parcels/${p.id}`}
          className="font-mono underline-offset-2 hover:underline"
        >
          {p.barcode}
        </Link>
        <WarehouseStatusBadge status={p.status} />
      </span>
    );
  }

  const label = p.tracking_number ?? p.barcode ?? p.id;
  return (
    <span className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs">
      {p.tracking_number ? (
        <Link
          href={`/parcels/${p.tracking_number}`}
          className="font-mono underline-offset-2 hover:underline"
        >
          {label}
        </Link>
      ) : (
        <span className="font-mono">{label}</span>
      )}
      <Badge variant="outline">
        {PUDO_FLOW_STATUSES.includes(p.status)
          ? t(`parcelTracking.eventCodes.${p.status as PudoFlowStatus}`)
          : p.status}
      </Badge>
    </span>
  );
}
