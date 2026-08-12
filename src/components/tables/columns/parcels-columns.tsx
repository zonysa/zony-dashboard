"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { TFunction } from "i18next";

interface ColumnsProps {
  t: TFunction<"common">;
}

export const Columns = ({ t }: ColumnsProps) => {
  const columns: ColumnDef<ParcelDetails>[] = [
    {
      accessorKey: "tracking_number",
      header: t("table.trackingNumber") || "Tracking Number",
      cell: ({ row }) => {
        const pudoId = row.getValue("tracking_number") as string;
        return <div className="font-mono text-sm">{pudoId}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "courier_id",
      header: t("table.courier"),
      cell: ({ row }) => {
        const courierId = row.getValue("courier_id") as string;
        return <div className="font-mono text-sm">{courierId}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "city_name",
      header: t("table.city") || "City",
      cell: ({ row }) => {
        const city = row.getValue("city_name") as string;
        return <div className="font-medium capitalize">{city}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "zone_name",
      header: t("table.zone") || "Zone",
      cell: ({ row }) => {
        const zone = row.getValue("zone_name") as string;
        return <div className="text-sm">{zone}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "receiving_date",
      header: t("table.receivingDate"),
      cell: ({ row }) => {
        const receivingDate = row.getValue("receiving_date") as Date;
        return (
          <div className="text-sm">
            {receivingDate ? receivingDate.toString() : "NA"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: t("table.status") || "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusVariant = (status: string) => {
          switch (status) {
            case "customer_received":
              return "success";
            case "courier_received":
            case "waiting_confirmation":
            case "PUDO_received":
              return "outline";
            case "pending":
              return "secondary";
            case "expired":
            case "expired_received":
              return "destructive";
            default:
              return "secondary";
          }
        };
        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`parcelTracking.eventCodes.${status}`, status.replace(/_/g, " "))}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "client_name",
      header: t("table.client"),
      cell: ({ row }) => {
        const client = row.getValue("client_name") as string | null;
        return <div className="font-medium">{client || "N/A"}</div>;
      },
      filterFn: "includesString",
    },
  ];

  return columns;
};
