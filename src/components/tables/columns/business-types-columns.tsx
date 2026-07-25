"use client";
import { ColumnDef } from "@tanstack/react-table";
import { BusinessTypeDetails } from "@/lib/schema/businessType.schema";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface BusinessTypesColumnsProps {
  onEdit?: (businessType: BusinessTypeDetails) => void;
  onDelete?: (id: number, name: string) => void;
}

export const createBusinessTypesColumns = ({
  onEdit,
  onDelete,
}: BusinessTypesColumnsProps = {}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<BusinessTypeDetails>[] = [
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
      header: t("table.name"),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return <div className="font-medium">{name}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "description",
      header: t("settings.businessTypes.descriptionLabel", {
        defaultValue: "Description",
      }),
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {description || "-"}
          </div>
        );
      },
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

  if (onEdit || onDelete) {
    columns.push({
      id: "actions",
      header: t("table.actions") || "Actions",
      cell: ({ row }) => {
        const businessType = row.original;

        return (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(businessType)}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  onDelete(Number(businessType.id), businessType.name)
                }
                className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    });
  }

  return columns;
};
