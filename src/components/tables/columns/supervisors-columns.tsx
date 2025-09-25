"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Supervisor } from "@/lib/schema/supervisors.schema";

export const columns: ColumnDef<Supervisor>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.getValue("name") as string;
      return <div className="font-medium">{name}</div>;
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
    accessorKey: "districts",
    header: "Districts",
    cell: ({ row }) => {
      const districts = row.getValue("districts") as string;
      return (
        <Badge variant="secondary" className="text-xs">
          {districts}
        </Badge>
      );
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
            return "muted";
          case "Pending":
            return "outline";
          case "Suspended":
            return "secondary";
          default:
            return "secondary";
        }
      };
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
];
