"use client";

import { columns } from "@/components/tables/columns/partners-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetPartners } from "@/lib/hooks/usePartner";
import { table } from "@/lib/schema/partner.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data: partners } = useGetPartners();

  const filterConfigs = [
    { key: "type", label: "Type", placeholder: "All Types" },
    { key: "status", label: "Status", placeholder: "All Status" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<table>) => {
    const partnerId = row.getValue("name");
    router.replace(`/partners/${partnerId}`);
  };

  return (
    <div className="px-6 py-10">
      <DataTable
        columns={columns}
        data={partners ? partners.partners : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search partners..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
