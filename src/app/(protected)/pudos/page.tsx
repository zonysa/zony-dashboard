"use client";

import { branchColumns } from "@/components/tables/columns/branches-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetBranches } from "@/lib/hooks/useBranch";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetZones } from "@/lib/hooks/useZone";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Branch, BranchFilterOptions } from "@/lib/schema/branch.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const [filters, setFilters] = useState<BranchFilterOptions>({});
  const { data: branches, isLoading } = useGetBranches(filters);
  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones();
  const { data: districts } = useGetDistricts();
  const columns = branchColumns();
  const { t } = useTranslation();

  // Map cities, zones, and districts to filter options
  const cityOptions = cities?.cities
    .filter((city) => city.id !== undefined)
    .map((city) => ({
      label: city.name,
      value: city.name,
    })) || [];

  const zoneOptions = zones?.zones
    .filter((zone) => zone.id !== undefined)
    .map((zone) => ({
      label: zone.name,
      value: zone.name,
    })) || [];

  const districtOptions = districts?.districts
    .filter((district) => district.id !== undefined)
    .map((district) => ({
      label: district.name,
      value: district.name,
    })) || [];

  const filterConfigs = [
    {
      key: "city",
      label: t("table.city"),
      placeholder: t("table.allCities"),
      options: cityOptions,
    },
    {
      key: "zone",
      label: t("table.zone"),
      placeholder: t("table.allZones"),
      options: zoneOptions,
    },
    {
      key: "district",
      label: t("table.district"),
      placeholder: t("table.allDistricts"),
      options: districtOptions,
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<Branch>) => {
    const pudoId = row.getValue("id") as string;
    router.replace(`/pudos/${pudoId}`);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={columns}
        data={branches?.pudos || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder="Search PUDO name..."
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </div>
  );
}
