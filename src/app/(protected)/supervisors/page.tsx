"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/columns/supervisors-columns";
import { useGetUsers } from "@/lib/hooks/useAuth";

export default function Page() {
  const { data: users } = useGetUsers({ role_id: 4 });
  const filterConfigs = [
    { key: "city", label: "City", placeholder: "All Cities" },
    { key: "zone", label: "Zone", placeholder: "All Zones" },
    { key: "district", label: "District", placeholder: "All Districts" },
  ];

  return (
    <div className="w-full mx-auto py-10 px-6">
      <DataTable
        columns={columns}
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
      />
    </div>
  );
}
