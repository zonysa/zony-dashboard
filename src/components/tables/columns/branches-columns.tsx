"use client";

import { Badge } from "@/components/ui/badge";
import { Branch } from "@/lib/types/branches.types";
import { ColumnDef } from "@tanstack/react-table";
import { Circle } from "lucide-react";

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

const getUsageClasses = (usage: number) => {
  if (usage >= 80) {
    return { text: "text-green-500", fill: "fill-green-500" };
  } else if (usage >= 50) {
    return { text: "text-yellow-500", fill: "fill-yellow-500" };
  } else {
    return { text: "text-red-500", fill: "fill-red-500" };
  }
};

export const branchColumns: ColumnDef<Branch>[] = [
  {
    accessorKey: "partnerName",
    header: "Partner Name",
    filterFn: "includesString",
    cell: ({ row }) => {
      const partnerName = row.getValue("partnerName") as string;
      return <div className="font-medium">{partnerName}</div>;
    },
  },
  {
    accessorKey: "pudoId",
    header: "PUDO ID",
    filterFn: "includesString",
    cell: ({ row }) => {
      const pudoId = row.getValue("pudoId") as string;
      return <div className="font-mono text-sm">{pudoId}</div>;
    },
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
    accessorKey: "zone",
    header: "Zone",
    cell: ({ row }) => {
      const zone = row.getValue("zone") as string;
      return <div className="text-center font-medium">{zone}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "district",
    header: "Districts",
    cell: ({ row }) => {
      const district = row.getValue("district") as string;
      return <div className="capitalize">{district}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "totalParcels",
    header: "Total Parcels",
    cell: ({ row }) => {
      const totalParcels = row.getValue("totalParcels") as number;
      return (
        <div className="text-center font-medium text-orange-600">
          {totalParcels.toLocaleString()}
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
      return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "pointUsage",
    header: "Point Usage",
    cell: ({ row }) => {
      const pointUsage = row.getValue("pointUsage") as number;
      const classes = getUsageClasses(pointUsage);

      return (
        <Badge variant="outline" className={classes.text}>
          <Circle className={`w-2 h-2 text-transparent fill ${classes.fill}`} />
          {pointUsage}%
        </Badge>
      );
    },
  },
];
