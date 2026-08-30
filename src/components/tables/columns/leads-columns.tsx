"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/lib/schema/lead.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "name",
      header: t("table.name") || "Name",
      filterFn: "includesString",
    },
    {
      accessorKey: "phone_number",
      header: t("leads.phone") || "Phone",
    },
    {
      accessorKey: "source_tab",
      header: t("leads.interestedIn") || "Interested in",
      cell: ({ row }) => {
        const sourceTab = row.getValue("source_tab") as string;
        return (
          <Badge variant="outline">
            {t(`leads.tabs.${sourceTab}`, { defaultValue: sourceTab })}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "status",
      header: t("table.status") || "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const getStatusVariant = (status: string) => {
          switch (status) {
            case "new":
              return "outline";
            case "contacted":
              return "secondary";
            case "converted":
              return "success";
            case "rejected":
              return "destructive";
            default:
              return "secondary";
          }
        };

        return (
          <Badge variant={getStatusVariant(status)}>
            {t(`leads.statuses.${status}`, { defaultValue: status })}
          </Badge>
        );
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "created_at",
      header: t("leads.submittedAt") || "Submitted",
      cell: ({ row }) => {
        const createdAt = row.getValue("created_at") as string;
        return <div>{new Date(createdAt).toLocaleDateString()}</div>;
      },
    },
  ];

  return columns;
};
