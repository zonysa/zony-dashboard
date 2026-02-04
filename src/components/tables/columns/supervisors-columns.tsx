"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserDetails } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const columns = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation();

  const columns: ColumnDef<UserDetails>[] = [
    {
      accessorKey: "first_name",
      header: t("table.firstName") || "Name",
      cell: ({ row }) => {
        const name = row.getValue("first_name") as string;
        const userId = row.original.id;

        return (
          <Link
            href={`/users/${userId}`}
            className="font-medium text-primary hover:underline"
          >
            {name}
          </Link>
        );
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
        const zoneId = row.original.zone_id;

        if (!zone) return <div className="text-sm text-muted-foreground">-</div>;

        if (!zoneId) return <div className="text-sm">{zone}</div>;

        return (
          <Link
            href={`/zones/${zoneId}`}
            className="flex items-center gap-1 text-sm hover:text-primary transition-colors group"
          >
            <span>{zone}</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        );
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
