"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/columns/supervisors-columns";
import { useGetUsers } from "@/lib/hooks/useAuth";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { data: users } = useGetUsers({ role_id: 4 });
  const { t } = useTranslation();

  const filterConfigs = [
    {
      key: "city",
      label: t("table.city") || "City",
      placeholder: t("table.allCities") || "All Cities",
    },
    {
      key: "zone",
      label: t("table.zone") || "Zone",
      placeholder: t("table.allZones") || "All Zones",
    },
    {
      key: "district",
      label: t("table.district") || "District",
      placeholder: t("table.allDistricts") || "All Districts",
    },
  ];

  return (
    <div className="w-full mx-auto py-10 px-6">
      <DataTable
        columns={columns()}
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
      />
    </div>
  );
}
