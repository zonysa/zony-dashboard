"use client";

import { customerServiceColumns } from "@/components/tables/columns/customer-service-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetUsers } from "@/lib/hooks/useAuth";

export default function Page() {
  const { data: users } = useGetUsers({ role_id: 5 });
  const filterConfigs = [
    { key: "status", label: "Status", placeholder: "Choose Status" },
  ];
  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={customerServiceColumns}
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search Cusomter Service..."
      />
    </div>
  );
}
