"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/courier-columns";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { UserDetails } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";

function Page() {
  const router = useRouter();
  const { data: couriers } = useGetUsers({ role_id: 6 });
  const { t } = useTranslation();

  const filterConfigs = [
    {
      key: "city",
      label: t("table.city") || "City",
      placeholder: t("table.allCities") || "All Cities",
    },
    {
      key: "district",
      label: t("table.district") || "District",
      placeholder: t("table.allDistricts") || "All Districts",
    },
    {
      key: "status",
      label: t("table.status") || "Status",
      placeholder: t("table.allStatus") || "All Status",
    },
  ];

  const handleRowClick = (row: Row<UserDetails>) => {
    const courierId = row.getValue("ID") as string;
    router.replace(`/courier/${courierId}`);
  };

  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns()}
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
