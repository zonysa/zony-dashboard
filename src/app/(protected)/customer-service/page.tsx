"use client";

import { columns } from "@/components/tables/columns/customer-service-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetUsers } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { data: users } = useGetUsers({ role_id: 5 });
  const { t } = useTranslation();

  const filterConfigs = [
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];
  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns()}
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search Cusomter Service..."
      />
    </div>
  );
}
