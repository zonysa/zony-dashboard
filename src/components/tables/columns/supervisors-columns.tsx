"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<UserDetails>[] = [
    {
      accessorKey: "first_name",
      header: t("table.firstName") || "Name",
      cell: ({ row }) => {
        const name = row.getValue("first_name") as string;
        return <div className="font-medium">{name}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "email",
      header: t("table.email"),
      cell: ({ row }) => {
        const email = row.getValue("email") as string;
        return <div className="font-mono text-sm">{email}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "city",
      header: t("table.city"),
      cell: ({ row }) => {
        const city = row.getValue("city") as string;
        return <div className="font-medium capitalize">{city}</div>;
      },
      filterFn: "equalsString",
    },
    {
      accessorKey: "zone",
      header: t("table.zone") || "Zone",
      cell: ({ row }) => {
        const zone = row.getValue("zone") as string;
        return <div className="text-sm">{zone}</div>;
      },
      filterFn: "includesString",
    },
    {
      accessorKey: "phone_number",
      header: t("table.phoneNumber"),
      cell: ({ row }) => {
        const phoneNumber = row.getValue("phone_number") as string;
        return <div className="text-sm">{phoneNumber}</div>;
      },
      filterFn: "includesString",
    },
  ];

  return columns;
};
