"use client";

import { Fragment } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Package, Store, Warehouse } from "lucide-react";
import { TFunction } from "i18next";

import { Badge } from "@/components/ui/badge";
import {
  ParcelFeedRow,
  ParcelLeg,
  ParcelLegPlaceType,
  ParcelRouteSource,
} from "@/lib/schema/parcel.schema";

interface ColumnsProps {
  t: TFunction<"common">;
}

const LEG_ICON: Record<ParcelLegPlaceType, typeof Package> = {
  warehouse: Warehouse,
  pudo: Store,
  customer: Package,
};

export const FeedColumns = ({ t }: ColumnsProps) => {
  const columns: ColumnDef<ParcelFeedRow>[] = [
    {
      // Barcode, not tracking number: it is the only identifier both flows
      // have. Warehouse parcels have no tracking number at all.
      accessorKey: "barcode",
      header: t("table.barcode"),
      cell: ({ row }) => {
        const { barcode, tracking_number: trackingNumber, flow } = row.original;
        // A bridged warehouse row gains a tracking number once a shop accepts
        // it — show it as the second identifier the customer was actually
        // texted, without pretending the warehouse barcode became it.
        const showTracking = flow === "warehouse" && !!trackingNumber;
        return (
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-sm">{barcode ?? "—"}</span>
            {showTracking && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {trackingNumber}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "route",
      header: t("parcelFeed.type"),
      cell: ({ row }) => (
        <RouteCell row={row.original} t={t} />
      ),
    },
    {
      accessorKey: "flow",
      header: t("parcelFeed.flow"),
      cell: ({ row }) => (
        <Badge variant="outline">
          {t(`parcelFeed.flows.${row.original.flow}`)}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t("table.status"),
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return <span className="text-muted-foreground">—</span>;

        // Both flows' statuses land in this column and they are different
        // vocabularies — `pending` is a PUDO status, `out_for_delivery` a
        // derived warehouse one. Colour by meaning, and fall back to the
        // humanised key rather than showing a missing-translation string.
        const variant = (() => {
          switch (status) {
            case "customer_received":
            case "delivered":
              return "success" as const;
            case "courier_received":
            case "waiting_confirmation":
            case "PUDO_received":
            case "out_for_delivery":
            case "ready_for_dispatch":
              return "outline" as const;
            case "expired":
            case "expired_received":
            case "attempt_failed":
              return "destructive" as const;
            default:
              return "secondary" as const;
          }
        })();

        return (
          <Badge variant={variant}>
            {t(
              `parcelTracking.eventCodes.${status}`,
              status.replace(/_/g, " "),
            )}
          </Badge>
        );
      },
    },
    {
      // One column for "which place is it associated with". A bridged
      // warehouse row carries BOTH: the shop it was handed to (pudo_name) and
      // the building it started at (warehouse_name) — the shop is the more
      // useful of the two once it's set, since that's where the box is now.
      id: "place",
      header: t("parcelFeed.place"),
      cell: ({ row }) => {
        const place = row.original.pudo_name ?? row.original.warehouse_name;
        return (
          <div className="text-sm">
            {place ?? <span className="text-muted-foreground">—</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "recipient_name",
      header: t("parcelFeed.recipient"),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.recipient_name ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "city_name",
      header: t("table.city"),
      cell: ({ row }) => (
        <div className="text-sm capitalize">
          {row.original.city_name ?? (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: t("table.date"),
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {row.original.created_at ?? "—"}
        </div>
      ),
    },
  ];

  return columns;
};

/**
 * The Type cell: the journey as a short chain of place icons, plus a one-line
 * label underneath. A parcel's route is a SEQUENCE, not a category — legs is
 * the ordered list ItineraryService derived server-side, each independently
 * marked planned or observed, and this renders exactly that rather than
 * collapsing it into one guess. `route`/`route_source` (also server-derived)
 * drive the label and its colour; `legs` drives the chain of icons above it.
 */
function RouteCell({ row, t }: { row: ParcelFeedRow; t: TFunction<"common"> }) {
  const { route, route_source: source, legs } = row;
  const unknown = route === "unknown";
  const isObserved = source === "observed";

  return (
    <div className="flex flex-col gap-1">
      {legs.length > 0 ? (
        <div className="flex items-center gap-0.5">
          {legs.map((leg, index) => (
            <Fragment key={leg.seq}>
              {index > 0 && (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/40" />
              )}
              <LegChip leg={leg} />
            </Fragment>
          ))}
        </div>
      ) : (
        <Package className="h-4 w-4 shrink-0 text-muted-foreground/50" />
      )}
      <div className="flex flex-col leading-tight">
        <span className={`text-sm ${unknown ? "text-muted-foreground" : ""}`}>
          {t(`parcelFeed.routes.${route}`)}
        </span>
        {!unknown && (
          <span
            className={`text-[11px] ${
              isObserved
                ? "text-muted-foreground"
                : "text-amber-600 dark:text-amber-500"
            }`}
          >
            {t(
              isObserved
                ? "parcelFeed.routeSource.observed"
                : "parcelFeed.routeSource.planned",
            )}
          </span>
        )}
      </div>
    </div>
  );
}

/** One leg's icon, dimmed for a planned (not-yet-happened) leg. */
function LegChip({ leg }: { leg: ParcelLeg }) {
  const Icon = LEG_ICON[leg.place_type] ?? Package;
  const isObserved = leg.source === "observed";
  return (
    <Icon
      className={`h-3.5 w-3.5 shrink-0 ${
        isObserved
          ? "text-muted-foreground"
          : "text-amber-600/70 dark:text-amber-500/70"
      }`}
      // Native title tooltip: cheap and accessible, no extra component needed
      // for something this secondary.
      aria-label={leg.place_name ?? leg.place_type}
    >
      <title>{leg.place_name ?? leg.place_type}</title>
    </Icon>
  );
}

export type { ParcelRouteSource };
