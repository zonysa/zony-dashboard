"use client";

import { DataTable } from "@/components/tables/data-table";
import React, { useState } from "react";
import { columns } from "@/components/tables/columns/courier-columns";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { UserDetails, userFilterOptions } from "@/lib/schema/user.schema";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";

function Page() {
  const router = useRouter();
  const { t } = useTranslation();

  const [filters, setFilters] = useState<userFilterOptions>({
    role_id: 6,
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: couriers, isLoading } = useGetUsers({
    ...filters,
    search: debouncedSearch,
  });

  const { data: cities } = useGetCities();
  const { data: districts } = useGetDistricts();

  // Map cities and districts to filter options
  const cityOptions = cities?.cities
    .filter((city) => city.id !== undefined)
    .map((city) => ({
      label: city.name,
      value: city.name,
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
      key: "district",
      label: t("table.district") || "District",
      placeholder: t("table.allDistricts") || "All Districts",
      options: districtOptions,
    },
    {
      key: "status",
      label: t("table.status") || "Status",
      placeholder: t("table.allStatus") || "All Status",
    },
  ];

  // const handleRowClick = (row: Row<UserDetails>) => {
  //   const courierId = row.getValue("ID") as string;
  //   router.replace(`/courier/${courierId}`);
  // };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      city: newFilters.city || undefined,
      district: newFilters.district || undefined,
      status: newFilters.status || undefined,
    }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  return (
    <div className="w-full py-10 px-6">
      <DataTable
        columns={columns()}
        data={couriers?.users ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        // onRowClick={handleRowClick}
        searchPlaceholder={t("table.search", "table.couriers")}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </div>
  );
}

export default Page;
