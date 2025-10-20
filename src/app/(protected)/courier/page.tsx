"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/courier-columns";
import { mockCouriers as data } from "@/lib/data/mocks/couriers.mock";
import { Row } from "@tanstack/react-table";
import { Courier } from "@/lib/schema/couriers.schema";
import { useRouter } from "next/navigation";

function page() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const router = useRouter();

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "district", label: "District", placeholder: "All Districties" },
    { key: "status", label: "Status", placeholder: "All Districties" },
  ];

  const handleRowClick = (row: Row<Courier>) => {
    const courierId = row.getValue("ID") as string;
    router.replace(`/courier/${courierId}`);
  };

  return (
    <div className="w-full py-10 px-6">
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
