"use client";

import { Badge } from "@/components/ui/badge";
import { BranchDetails } from "@/lib/schema/branch.schema";
import { ColumnDef } from "@tanstack/react-table";
import { Circle } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

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

export const branchColumns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<BranchDetails>[] = [
    {
      accessorKey: "id",
      header: t("table.id") || "ID",
      filterFn: "includesString",
      cell: ({ row }) => {
        const pudoId = row.getValue("id") as string;
        return <div className="font-mono text-sm">{pudoId}</div>;
      },
    },
    {
      accessorKey: "name",
      header: t("table.pudo"),
      filterFn: "includesString",
      cell: ({ row }) => {
        const branchName = row.getValue("name") as string;
        return (
          <div className="font-medium">{branchName ? branchName : "NA"}</div>
        );
      },
    },
    {
      accessorKey: "city_name",
      header: t("table.city") || "City",
      cell: ({ row }) => {
        const city = row.getValue("city_name") as string;
        return <div className="font-medium">{city ? city : "NA"}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "zone_name",
      header: t("table.zone") || "Zone",
      cell: ({ row }) => {
        const zone = row.getValue("zone_name") as string;
        return <div className="font-medium">{zone ? zone : "NA"}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "district_name",
      header: t("table.district") || "Districts",
      cell: ({ row }) => {
        const district = row.getValue("district_name") as string;
        return (
          <div className="capitalize font-medium">
            {district ? district : "NA"}
          </div>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "total_parcels",
      header: t("table.totalParcels"),
      cell: ({ row }) => {
        const totalParcels = row.getValue("total_parcels") as number;
        return (
          <div className="font-medium text-orange-600">
            {totalParcels ? totalParcels.toLocaleString() : 0}
          </div>
        );
      },
    },
    {
      accessorKey: "supervisor_names",
      header: t("supervisors.title"),
      cell: ({ row }) => {
        const supervisor = row.getValue("supervisor_names") as string;
        return (
          <div className="font-medium">{supervisor ? supervisor[0] : "NA"}</div>
        );
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "partner_name",
      header: t("table.partner"),
      cell: ({ row }) => {
        const partner = row.getValue("partner_name") as string;
        return <div className="font-medium">{partner ? partner : "NA"}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "status",
      header: t("table.status") || "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        return <Badge variant={getStatusVariant(status)}>{status}</Badge>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "point_usage_percels",
      header: t("table.pointUsage"),
      cell: ({ row }) => {
        const pointUsage = row.getValue("point_usage_percels") as number;
        const classes = getUsageClasses(pointUsage);

        return (
          <Badge variant="outline" className={classes.text}>
            <Circle
              className={`w-2 h-2 text-transparent fill ${classes.fill}`}
            />
            {pointUsage}%
          </Badge>
        );
      },
    },
  ];

  return columns;
};
