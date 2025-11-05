"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { PartnerDetails } from "@/lib/schema/partner.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<PartnerDetails>[] = [
    {
      accessorKey: "id",
      header: t("table.id") || "ID",
      filterFn: "includesString",
    },
    {
      accessorKey: "name",
      header: t("table.partner") || "Partner",
      filterFn: "includesString",
    },
    {
      accessorKey: "type",
      header: t("table.type") || "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string;
        return <div className="capitalize">{type}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "pudos",
      header: t("table.pudo") || "PUDOs",
      cell: ({ row }) => {
        // const pudos = row.getValue("pudos") as number;
        // return <div className="text-center font-medium">{pudos}</div>;
        return <div className="font-medium">15</div>;
      },
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
