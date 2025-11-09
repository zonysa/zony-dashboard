"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<ZoneDetails>[] = [
    {
      accessorKey: "id",
      header: t("table.id"),
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return <div className="font-mono text-sm">{id}</div>;
      },
      filterFn: "includesString",
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
      accessorKey: "total_pudos",
      header: t("table.totalPudos"),
      cell: ({ row }) => {
        const totPudos = row.getValue("total_pudos") as number;
        return <div className="font-medium">{totPudos ? totPudos : "NA"}</div>;
      },
    },
    {
      accessorKey: "total_parcels",
      header: t("table.parcel") || "Parcels",
      cell: ({ row }) => {
        const parcels = row.getValue("total_parcels") as number;
        return (
          <div className="font-medium">
            {parcels ? parcels.toLocaleString() : "NA"}
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
      accessorKey: "status",
      header: t("table.status") || "Status",
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
        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`status.${status.toLowerCase()}`, { defaultValue: status })}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
  ];

  return columns;
};
