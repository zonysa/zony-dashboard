"use client";

import { columns } from "@/components/tables/columns/partners-columns";
import { DataTable } from "@/components/tables/data-table";
import { mockPartners as data } from "@/lib/data/mocks/partner.mock";
import { Partner } from "@/lib/schema/partners.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";

export default function Page() {
  const filterConfigs = [
    { key: "type", label: "Type", placeholder: "All Types" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<Partner>) => {
    const partnerId = row.getValue("name") as string;
    router.replace(`/partners/${partnerId}`);
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search partners..."
        onRowClick={handleRowClick}
      />
    </div>
  );
}
