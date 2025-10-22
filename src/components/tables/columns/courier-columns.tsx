"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";

export const columns: ColumnDef<UserDetails>[] = [
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }) => {
      const firstName = row.getValue("first_name") as string;
      return <div className="font-medium">{firstName}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const id = row.getValue("id") as string;
      return <div className="font-mono text-sm">{id}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => {
      const city = row.getValue("city") as string;
      return <div className="font-medium capitalize">{city}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "zone",
    header: "Zone",
    cell: ({ row }) => {
      const zone = row.getValue("zone") as string;
      return <div className="text-sm">{zone}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case "Active":
            return "success";
          case "Inactive":
            return "destructive";
          case "On Duty":
            return "outline";
          case "Off Duty":
            return "secondary";
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
