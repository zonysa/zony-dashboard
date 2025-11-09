"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/lib/schema/client.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<Client>[] = [
    {
      accessorKey: "id",
      header: t("table.id") || "ID",
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: t("table.client"),
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: t("table.type") || "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <div className="capitalize">{type}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "total_parcels",
      header: t("table.totalParcels"),
      cell: ({ row }) => {
        // You'll need to add this field to your API response or calculate it
        const totalParcels = row.original.total_parcels || 0;
        return <div className="font-medium">{totalParcels}</div>;
      },
    },
    {
      accessorKey: "delivery_rate",
      header: t("table.deliveryRate"),
      cell: ({ row }) => {
        // You'll need to add this field to your API response or calculate it
        const deliveryRate = row.original.delivery_rate || 0;
        return <div className="font-medium">{deliveryRate}%</div>;
      },
    },
    {
      accessorKey: "pudo_points_used",
      header: t("table.pudo") || "PUDO Point Used",
      cell: ({ row }) => {
        // You'll need to add this field to your API response or calculate it
        const pudoPoints = row.original.pudo_points_used || 0;
        return <div className="font-medium">{pudoPoints}</div>;
      },
    },
    {
      accessorKey: "status",
      header: t("table.status") || "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const getStatusVariant = (status: string) => {
          switch (status.toLowerCase()) {
            case "active":
              return "success";
            case "inactive":
              return "secondary";
            case "pending":
              return "outline";
            case "suspended":
              return "destructive";
            default:
              return "secondary";
          }
        };
        return (
          <Badge variant={getStatusVariant(status)} className="capitalize">
            {t(`status.${status.toLowerCase()}`, { defaultValue: status })}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
  ];

  return columns;
};
