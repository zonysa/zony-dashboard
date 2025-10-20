"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/lib/schema/client.schema";

export const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Client",
    filterFn: "includesString",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return <div className="capitalize">{type}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "total_parcels",
    header: "Total Parcels",
    cell: ({ row }) => {
      // You'll need to add this field to your API response or calculate it
      const totalParcels = row.original.total_parcels || 0;
      return <div className="text-center font-medium">{totalParcels}</div>;
    },
  },
  {
    accessorKey: "delivery_rate",
    header: "Delivery Rate",
    cell: ({ row }) => {
      // You'll need to add this field to your API response or calculate it
      const deliveryRate = row.original.delivery_rate || 0;
      return <div className="text-center font-medium">{deliveryRate}%</div>;
    },
  },
  {
    accessorKey: "pudo_points_used",
    header: "PUDO Point Used",
    cell: ({ row }) => {
      // You'll need to add this field to your API response or calculate it
      const pudoPoints = row.original.pudo_points_used || 0;
      return <div className="text-center font-medium">{pudoPoints}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
          case "active":
            return "sucess";
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
          {status}
        </Badge>
      );
    },
    filterFn: "equalsString",
  },
];
