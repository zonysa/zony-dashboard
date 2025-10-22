"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/courier-columns";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { UserDetails } from "@/lib/schema/user.schema";

function Page() {
  const router = useRouter();
  const { data: couriers } = useGetUsers({ role_id: 6 });

  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "district", label: "District", placeholder: "All Districties" },
    { key: "status", label: "Status", placeholder: "All Districties" },
  ];

  const handleRowClick = (row: Row<UserDetails>) => {
    const courierId = row.getValue("ID") as string;
    router.replace(`/courier/${courierId}`);
  };

  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns}
        data={couriers?.users ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        onRowClick={handleRowClick}
        searchPlaceholder="Search partners..."
      />
    </div>
  );
}

export default Page;
