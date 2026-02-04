"use client";

import { DataTable } from "@/components/tables/data-table";
import { columns } from "@/components/tables/columns/supervisors-columns";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetZones } from "@/lib/hooks/useZone";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useState } from "react";
import { userFilterOptions } from "@/lib/schema/user.schema";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function Page() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<userFilterOptions>({
    role_id: 4,
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: users, isLoading } = useGetUsers({
    ...filters,
    search: debouncedSearch,
  });

  const { data: cities } = useGetCities();
  const { data: zones } = useGetZones();
  const { data: districts } = useGetDistricts();

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
      label: t("table.city") || "City",
      placeholder: t("table.allCities") || "All Cities",
      options: cityOptions,
    },
    {
      key: "zone",
      label: t("table.zone") || "Zone",
      placeholder: t("table.allZones") || "All Zones",
      options: zoneOptions,
    },
    {
      key: "district",
      label: t("table.district") || "District",
      placeholder: t("table.allDistricts") || "All Districts",
      options: districtOptions,
    },
  ];

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      city: newFilters.city || undefined,
      zone: newFilters.zone || undefined,
      district: newFilters.district || undefined,
    }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  return (
    <div className="w-full mx-auto py-10 px-6">
      <DataTable
        columns={columns()}
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search", "table.supervisors")}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </div>
  );
}
