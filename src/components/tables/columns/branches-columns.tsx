"use client";

import { Badge } from "@/components/ui/badge";
import { BranchDetails } from "@/lib/schema/branch.schema";
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

export const branchColumns: ColumnDef<BranchDetails>[] = [
  {
    accessorKey: "id",
    header: "ID",
    filterFn: "includesString",
    cell: ({ row }) => {
      const pudoId = row.getValue("id") as string;
      return <div className="font-mono text-sm">{pudoId}</div>;
    },
  },
  {
    accessorKey: "name",
    header: "Branch Name",
    filterFn: "includesString",
    cell: ({ row }) => {
      const branchName = row.getValue("name") as string;
      return (
        <div className="font-medium">{branchName ? branchName : "NA"}</div>
      );
    },
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
    accessorKey: "zone",
    header: "Zone",
    cell: ({ row }) => {
      const zone = row.getValue("zone") as string;
      return <div className="font-medium">{zone ? zone : "NA"}</div>;
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "district",
    header: "Districts",
    cell: ({ row }) => {
      const district = row.getValue("district") as string;
      return (
        <div className="capitalize font-medium">
          {district ? district : "NA"}
        </div>
      );
    },
    filterFn: "equalsString",
  },
  {
    accessorKey: "totalParcels",
    header: "Total Parcels",
    cell: ({ row }) => {
      const totalParcels = row.getValue("totalParcels") as number;
      return (
        <div className="font-medium text-orange-600">
          {totalParcels ? totalParcels.toLocaleString() : "NA"}
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
          {pointUsage ? pointUsage : 20}%
        </Badge>
      );
    },
  },
];
