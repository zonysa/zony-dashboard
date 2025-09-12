"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge"; // Adjust import path as needed
import { Partner } from "@/lib/schema/partners.schema";

export const columns: ColumnDef<Partner>[] = [
  {
    accessorKey: "name",
    header: "Partner",
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
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const city = row.getValue("city") as string;
      return <div className="font-medium">{city}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "district",
    header: "District",
    cell: ({ row }) => {
      const district = row.getValue("district") as string;
      return <div className="capitalize">{district}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "pudos",
    header: "PUDOs",
    cell: ({ row }) => {
      const pudos = row.getValue("pudos") as number;
      return <div className="text-center font-medium">{pudos}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;

      const getStatusVariant = (status: string) => {
        switch (status) {
          case "Active":
            return "default"; // or "success" if you have a success variant
          case "Inactive":
            return "secondary";
          case "Pending":
            return "outline";
          case "Suspended":
            return "destructive";
          default:
            return "secondary";
        }
      };

      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
];
