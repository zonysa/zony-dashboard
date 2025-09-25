"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/zones-columns";
import { mockZones as data } from "@/lib/data/mocks/zones.mock";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { Zone } from "@/lib/schema/zones.schema";

function page() {
  const router = useRouter();

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
  ];

  const handleRowClick = (row: Row<Zone>) => {
    const zoneId = row.getValue("zoneId") as string;
    router.replace(`/zones/${zoneId}`);
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={data}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        onRowClick={handleRowClick}
        searchPlaceholder="Search partners..."
      />
    </div>
  );
}

export default page;
