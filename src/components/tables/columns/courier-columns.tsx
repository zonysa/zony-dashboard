"use client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface CourierColumnsProps {
  /**
   * Edit and delete — the backend allows both for admins only, so the page
   * passes these only to them. View is open to everyone who sees the table.
   */
  onEdit?: (courier: UserDetails) => void;
  onDelete?: (courier: UserDetails) => void;
}

export const columns = ({ onEdit, onDelete }: CourierColumnsProps = {}) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<UserDetails>[] = [
    {
      id: "name",
      accessorFn: (u) =>
        [u.first_name, u.last_name].filter(Boolean).join(" ").trim() ||
        u.username,
      header: t("table.name") || "Name",
      cell: ({ row, getValue }) => (
        <Link
          href={`/users/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {getValue<string>()}
        </Link>
      ),
      filterFn: "includesString",
    },
    {
      accessorKey: "email",
      header: t("table.email") || "Email",
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return <div className="font-medium">{email}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "is_active",
      header: t("table.status") || "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("status") as string;
        return (
          <Badge variant={isActive ? "success" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      id: "actions",
      header: t("table.actions") || "Actions",
      cell: ({ row }) => {
        const courier = row.original;
        return (
          <div className="flex items-center gap-1">
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title={t("common.view")}
            >
              <Link href={`/users/${courier.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                title={t("common.edit")}
                onClick={() => onEdit(courier)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                title={t("common.delete")}
                onClick={() => onDelete(courier)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
