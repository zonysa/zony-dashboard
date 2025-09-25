"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Parcel } from "@/lib/schema/parcels.schema";

export const columns: ColumnDef<Parcel>[] = [
  {
    accessorKey: "trackingNumber",
    header: "TN",
    cell: ({ row }) => {
      const trackingNumber = row.getValue("trackingNumber") as string;
      return <div className="font-mono text-sm">{trackingNumber}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "pudoId",
    header: "PUDO ID",
    cell: ({ row }) => {
      const pudoId = row.getValue("pudoId") as string;
      return <div className="font-mono text-sm">{pudoId}</div>;
    },
    filterFn: "includesString",
  },
  {
    accessorKey: "courierId",
    header: "Coureir ID",
    cell: ({ row }) => {
      const courierId = row.getValue("courierId") as string;
      return <div className="font-mono text-sm">{courierId}</div>;
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
    accessorKey: "receivingDate",
    header: "Receiving Date",
    cell: ({ row }) => {
      const receivingDate = row.getValue("receivingDate") as Date;
      return (
        <div className="text-sm">{receivingDate.toLocaleDateString()}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
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
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.getValue("client") as string;
      return <div className="font-medium">{client}</div>;
    },
    filterFn: "includesString",
  },
];
