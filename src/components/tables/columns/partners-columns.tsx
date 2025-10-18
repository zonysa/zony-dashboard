"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge"; // Adjust import path as needed
import { table } from "@/lib/schema/partner.schema";

export const columns: ColumnDef<table>[] = [
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
    accessorKey: "pudos",
    header: "PUDOs",
    cell: ({ row }) => {
      // const pudos = row.getValue("pudos") as number;
      // return <div className="text-center font-medium">{pudos}</div>;
      return <div className="text-center font-medium">15</div>;
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
            return "sucess";
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
