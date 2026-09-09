"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Package, Store, Warehouse } from "lucide-react";
import { TFunction } from "i18next";

import { Badge } from "@/components/ui/badge";
import {
  ParcelFeedRow,
  ParcelRoute,
  ParcelRouteSource,
} from "@/lib/schema/parcel.schema";

interface ColumnsProps {
  t: TFunction<"common">;
}

/**
 * Icon per route. The icon is the *destination-defining* leg: a PUDO route is
 * marked by the shop, a warehouse route by the building, a direct one by the
 * parcel itself.
 */
const ROUTE_ICON: Record<ParcelRoute, typeof Package> = {
  customer_direct: Package,
  pudo_customer: Store,
  warehouse_customer: Warehouse,
  unknown: Package,
};

export const FeedColumns = ({ t }: ColumnsProps) => {
  const columns: ColumnDef<ParcelFeedRow>[] = [
    {
      // Barcode, not tracking number: it is the only identifier both flows
      // have. Warehouse parcels have no tracking number at all.
      accessorKey: "barcode",
      header: t("table.barcode"),
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.barcode ?? "—"}</div>
      ),
    },
    {
      accessorKey: "route",
      header: t("parcelFeed.type"),
      cell: ({ row }) => {
        const { route, route_source: source } = row.original;
        const Icon = ROUTE_ICON[route] ?? Package;

        // A planned route is what someone booked; an observed one is where the
        // parcel was actually scanned. They disagree often enough that showing
        // a plan as though it were fact would be misleading, so the two are
        // visually distinct rather than merged into one label.
        const isObserved: boolean = source === "observed";
        const unknown = route === "unknown";

        return (
          <div className="flex items-center gap-2">
            <Icon
              className={`h-4 w-4 shrink-0 ${
                unknown ? "text-muted-foreground/50" : "text-muted-foreground"
              }`}
            />
            <div className="flex flex-col leading-tight">
              <span
                className={`text-sm ${unknown ? "text-muted-foreground" : ""}`}
              >
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
      },
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
      // One column for "which place is it associated with", since a row has
      // either a PUDO or a warehouse and never both.
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

export type { ParcelRouteSource };
