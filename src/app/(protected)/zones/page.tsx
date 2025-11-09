"use client";

import { DataTable } from "@/components/tables/data-table";
import React from "react";
import { columns } from "@/components/tables/columns/zones-columns";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { ZoneDetails } from "@/lib/schema/zones.schema";
import { useGetZones } from "@/lib/hooks/useZone";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { data: zones } = useGetZones();
  const { t } = useTranslation();

  const filterConfigs = [
    { key: "city", label: t("table.city"), placeholder: t("table.allCities") },
    {
      key: "district",
      label: t("table.district"),
      placeholder: t("table.allDistricts"),
    },
    {
      key: "supervisor",
      label: t("supervisors.title"),
      placeholder: t("table.allSupervisors"),
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<ZoneDetails>) => {
    const zoneId = row.getValue("id") as string;
    router.replace(`/zones/${zoneId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns()}
        data={zones ? zones.zones : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        onRowClick={handleRowClick}
        searchPlaceholder={t("table.search", "zone.title") + "..."}
      />
    </div>
  );
}
