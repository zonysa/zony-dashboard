"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Zone } from "@/lib/schema/zones.schema";
import { useRouter } from "next/navigation";

export const columns: ColumnDef<Zone>[] = [
  {
    accessorKey: "zoneId",
    header: "Zone ID",
    cell: ({ row }) => {
      const zoneId = row.getValue("zoneId") as string;
      return <div className="font-mono text-sm">{zoneId}</div>;
    },
    filterFn: "includesString",
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
    accessorKey: "districts",
    header: "Districts",
    cell: ({ row }) => {
      const districts = row.getValue("districts") as string;
      return <div className="capitalize">{districts}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "pudoPoints",
    header: "PUDO Points",
    cell: ({ row }) => {
      const pudoPoints = row.getValue("pudoPoints") as number;
      return <div className="text-center font-medium">{pudoPoints}</div>;
    },
  },
  {
    accessorKey: "parcels",
    header: "Parcels",
    cell: ({ row }) => {
      const parcels = row.getValue("parcels") as number;
      return (
        <div className="text-center font-medium">
          {parcels.toLocaleString()}
        </div>
      );
    },
  },
  {
    accessorKey: "supervisor",
    header: "Supervisor",
    cell: ({ row }) => {
      const supervisor = row.getValue("supervisor") as string;
      return <div className="font-medium">{supervisor}</div>;
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
