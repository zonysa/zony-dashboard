"use client";

import { columns } from "@/components/tables/columns/clients-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetClients } from "@/lib/hooks/useClient";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Client } from "@/lib/schema/client.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: clients } = useGetClients();
  const { t } = useTranslation();

  const filterConfigs = [
    { key: "type", label: t("table.type"), placeholder: t("table.allTypes") },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<Client>) => {
    const id = row.getValue("id");
    router.replace(`/clients/${id}`);
  };

  return (
    <div className="px-6 py-10">
      <DataTable
        columns={columns()}
        data={clients ? clients?.clients : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search partners..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
