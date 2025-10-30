"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ZoneDetails } from "@/lib/schema/zones.schema";

export const columns: ColumnDef<ZoneDetails>[] = [
  {
    accessorKey: "id",
    header: "Zone ID",
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
      return <div className="font-medium">{city ? city : "NA"}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "totalPudos",
    header: "PUDO Points",
    cell: ({ row }) => {
      const totPudos = row.getValue("totalPudos") as number;
      return <div className="font-medium">{totPudos ? totPudos : "NA"}</div>;
    },
  },
  {
    accessorKey: "totalParcels",
    header: "Parcels",
    cell: ({ row }) => {
      const parcels = row.getValue("totalParcels") as number;
      return (
        <div className="font-medium">
          {parcels ? parcels.toLocaleString() : "NA"}
        </div>
      );
    },
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    cell: ({ row }) => {
      const supervisor = row.getValue("supervisor") as string;
      return (
        <div className="font-medium">{supervisor ? supervisor : "NA"}</div>
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
