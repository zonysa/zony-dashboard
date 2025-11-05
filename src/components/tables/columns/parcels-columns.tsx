"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ParcelDetails } from "@/lib/schema/parcel.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<ParcelDetails>[] = [
    {
      accessorKey: "id",
      header: t("table.id") || "ID",
      cell: ({ row }) => {
        const parcelId = row.getValue("id") as string;
        return <div className="font-mono text-sm">{parcelId}</div>;
      },
      filterFn: "includesString",
      enableSorting: false,
    },
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
      header: "Courier ID",
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
      header: "Receiving Date",
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
            case "Delivered":
              return "success";
            case "In Transit":
              return "outline";
            case "Pending":
              return "secondary";
            case "Failed":
              return "destructive";
            case "Returned":
              return "secondary";
            default:
              return "secondary";
          }
        };
        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`status.${status.toLowerCase().replace(" ", "_")}`, {
              defaultValue: status,
            })}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "client_name",
      header: "Client",
      cell: ({ row }) => {
        const client = row.getValue("client_name") as string;
        return <div className="font-medium">{client}</div>;
      },
      filterFn: "includesString",
    },
  ];

  return columns;
};
