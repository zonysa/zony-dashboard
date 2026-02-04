"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CityDetails } from "@/lib/schema/city.schema";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface CitiesColumnsProps {
  onDelete?: (id: number, name: string) => void;
}

export const createCitiesColumns = ({
  onDelete,
}: CitiesColumnsProps = {}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<CityDetails>[] = [
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
      header: t("table.city"),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return <div className="font-medium">{name}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "created_at",
      header: t("table.createdAt") || "Created At",
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string;
        return (
          <div className="text-sm">
            {date ? new Date(date).toLocaleDateString() : "-"}
          </div>
        );
      },
    },
  ];

  // Add actions column if onDelete is provided
  if (onDelete) {
    columns.push({
      id: "actions",
      header: t("table.actions") || "Actions",
      cell: ({ row }) => {
        const city = row.original;

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(Number(city.id), city.name)}
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
