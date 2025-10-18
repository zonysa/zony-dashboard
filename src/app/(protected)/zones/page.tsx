"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/zones-columns";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { ZoneTable } from "@/lib/schema/zones.schema";
import { useGetZones } from "@/lib/hooks/useZone";

export default function Page() {
  const { data: zones } = useGetZones();

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "district", label: "district", placeholder: "All Districts" },
    { key: "supervisor", label: "Supervisor", placeholder: "All Supervisor" },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<ZoneTable>) => {
    const zoneId = row.getValue("zoneId") as string;
    router.replace(`/zones/${zoneId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns}
        data={zones ? zones.zones : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        onRowClick={handleRowClick}
        searchPlaceholder="Search partners..."
      />
    </div>
  );
}
