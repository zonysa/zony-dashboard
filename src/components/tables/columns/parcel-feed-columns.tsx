"use client";

import { Fragment } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, Package, Store, Warehouse } from "lucide-react";
import { TFunction } from "i18next";
import { isValid, parse } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ParcelFeedRow,
  ParcelLeg,
  ParcelLegPlaceType,
  ParcelRouteSource,
} from "@/lib/schema/parcel.schema";
import { canEmit, WHParcelStatus } from "@/lib/schema/warehouse.schema";

interface ColumnsProps {
  t: TFunction<"common">;
  /** i18n language code; picks the date locale. */
  language?: string;
  /**
   * Opens courier assignment for a row. Pass it only when the viewer may
   * assign (MANAGE_WAREHOUSE) — without it the actions column is left out.
   */
  onAssign?: (row: ParcelFeedRow) => void;
}

/**
 * Whether a feed row can take an E03 courier assignment. Only warehouse rows:
 * the PUDO flow has no assignment step. And only from the statuses the
 * warehouse transition table allows (ready_for_delivery/assigned and their
 * RTO equivalents) — the server still has the final say.
 */
export function canAssignFeedRow(row: ParcelFeedRow) {
  return (
    row.flow === "warehouse" &&
    !!row.status &&
    canEmit(row.status as WHParcelStatus, "E03")
  );
}

/**
 * A feed row's status, in the reader's language. The column mixes two closed
 * vocabularies that never share a key — the PUDO flow's stored statuses and
 * the warehouse module's derived ones — and each already has its labels in
 * the locale files, so look in both. Humanised key as the last resort, never
 * a missing-translation path.
 */
export function parcelStatusLabel(t: TFunction<"common">, status: string) {
  return t(
    [`parcelTracking.eventCodes.${status}`, `warehouseWall.status.${status}`],
    {
      defaultValue: status.replace(/_/g, " "),
    },
  );
}

/**
 * The backend sends `2026-11-12 11:09:29 PM` (ParcelFeedRowSchema's format):
 * Riyadh wall-clock time with no offset. Parsed as a naive local time and
 * formatted back without a time zone, so the wall time shown is exactly the
 * one stored. Gregorian with Latin digits in Arabic too — `ar` alone would
 * pick Arabic-Indic digits, out of step with the barcodes and counts beside it.
 */
export function formatFeedDateTime(value: string | null, language?: string) {
  if (!value) return null;
  const date = parse(value, "yyyy-MM-dd hh:mm:ss a", new Date());
  if (!isValid(date)) return value;
  return new Intl.DateTimeFormat(
    language === "ar" ? "ar-u-ca-gregory-nu-latn" : "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(date);
}

const LEG_ICON: Record<ParcelLegPlaceType, typeof Package> = {
  warehouse: Warehouse,
  pudo: Store,
  customer: Package,
};

export const FeedColumns = ({ t, language, onAssign }: ColumnsProps) => {
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
      cell: ({ row }) => <RouteCell row={row.original} t={t} />,
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

        return <Badge variant={variant}>{parcelStatusLabel(t, status)}</Badge>;
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
          {formatFeedDateTime(row.original.created_at, language) ?? "—"}
        </div>
      ),
    },
  ];

  if (onAssign) {
    columns.push({
      id: "actions",
      header: t("table.actions"),
      cell: ({ row }) => {
        if (!canAssignFeedRow(row.original)) return null;
        const reassign =
          row.original.status === "assigned" ||
          row.original.status === "rto_assigned";
        return (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(e) => {
              // The row itself navigates to the parcel's detail screen.
              e.stopPropagation();
              onAssign(row.original);
            }}
          >
            {reassign
              ? t("parcelFeed.actions.reassignCourier")
              : t("parcelFeed.actions.assignCourier")}
          </Button>
        );
      },
    });
  }

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
              <LegChip leg={leg} t={t} />
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
function LegChip({ leg, t }: { leg: ParcelLeg; t: TFunction<"common"> }) {
  const Icon = LEG_ICON[leg.place_type] ?? Package;
  const isObserved = leg.source === "observed";
  // A planned leg to a not-yet-chosen shop has no name; say what kind of
  // place it is rather than leaking the raw `place_type` key.
  const label = leg.place_name ?? t(`parcelFeed.places.${leg.place_type}`);
  return (
    <Icon
      className={`h-3.5 w-3.5 shrink-0 ${
        isObserved
          ? "text-muted-foreground"
          : "text-amber-600/70 dark:text-amber-500/70"
      }`}
      // Native title tooltip: cheap and accessible, no extra component needed
      // for something this secondary.
      aria-label={label}
    >
      <title>{label}</title>
    </Icon>
  );
}

export type { ParcelRouteSource };
