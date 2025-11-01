"use client";

import { columns } from "@/components/tables/columns/clients-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetClients } from "@/lib/hooks/useClient";
import { Client } from "@/lib/schema/client.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: clients } = useGetClients();

  const filterConfigs = [
    { key: "type", label: "Type", placeholder: "All Types" },
    { key: "status", label: "Status", placeholder: "All Status" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<Client>) => {
    const id = row.getValue("id");
    router.replace(`/clients/${id}`);
  };

  return (
    <div className="px-6 py-10">
      <DataTable
        columns={columns}
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
