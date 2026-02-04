"use client";
import { ColumnDef } from "@tanstack/react-table";
import { DistrictDetails } from "@/lib/schema/district.schema";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface DistrictsColumnsProps {
  onDelete?: (id: number, name: string) => void;
}

export const createDistrictsColumns = ({
  onDelete,
}: DistrictsColumnsProps = {}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<DistrictDetails>[] = [
    {
      accessorKey: "id",
      header: t("table.id"),
      cell: ({ row }) => {
        const id = row.getValue("id") as string;
        return <div className="font-medium">{id}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: t("table.district"),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return <div className="font-medium">{name}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "city_id",
      header: t("table.city") || "City",
      cell: ({ row }) => {
        const cityId = row.getValue("city_id") as number;
        return <div className="text-sm">{cityId}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "zone_id",
      header: t("table.zone") || "Zone",
      cell: ({ row }) => {
        const zoneId = row.getValue("zone_id") as number | null;
        return <div className="text-sm">{zoneId || "-"}</div>;
      },
    },
  ];

  // Add actions column if onDelete is provided
  if (onDelete) {
    columns.push({
      id: "actions",
      header: t("table.actions") || "Actions",
      cell: ({ row }) => {
        const district = row.original;

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(Number(district.id), district.name)}
            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        );
      },
    });
  }

  return columns;
};
