"use client";

import { DataTable } from "@/components/tables/data-table";
import React, { useState } from "react";
import { columns } from "@/components/tables/columns/zones-columns";
import { createCitiesColumns } from "@/components/tables/columns/cities-columns";
import { createDistrictsColumns } from "@/components/tables/columns/districts-columns";
import { useRouter } from "next/navigation";
import { Row } from "@tanstack/react-table";
import { ZoneDetails, GetZonesFilter } from "@/lib/schema/zones.schema";
import { useGetZones } from "@/lib/hooks/useZone";
import { useGetCities } from "@/lib/hooks/useCity";
import { useGetDistricts } from "@/lib/hooks/useDistrict";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Page() {
  const [filters, setFilters] = useState<GetZonesFilter>({});
  const { data: zones, isLoading: zonesLoading } = useGetZones(filters);
  const { data: cities, isLoading: citiesLoading } = useGetCities();
  const { data: districts, isLoading: districtsLoading } = useGetDistricts();
  const { t } = useTranslation();

  // Map cities and districts to filter options
  const cityOptions = cities?.cities
    .filter((city) => city.id !== undefined)
    .map((city) => ({
      label: city.name,
      value: String(city.id),
    })) || [];

  const districtOptions = districts?.districts
    .filter((district) => district.id !== undefined)
    .map((district) => ({
      label: district.name,
      value: String(district.id),
    })) || [];

  const filterConfigs = [
    {
      key: "cityId",
      label: t("table.city"),
      placeholder: t("table.allCities"),
      options: cityOptions,
    },
    {
      key: "districtId",
      label: t("table.district"),
      placeholder: t("table.allDistricts"),
      options: districtOptions,
    },
  ];

  const router = useRouter();
  const handleRowClick = (row: Row<ZoneDetails>) => {
    const zoneId = row.getValue("id") as string;
    router.replace(`/zones/${zoneId}`);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    // Convert string values to numbers for cityId and districtId
    const parsedFilters: Partial<GetZonesFilter> = {};
    if (newFilters.cityId) {
      parsedFilters.cityId = parseInt(newFilters.cityId, 10);
    }
    if (newFilters.districtId) {
      parsedFilters.districtId = parseInt(newFilters.districtId, 10);
    }
    if (newFilters.status) {
      parsedFilters.status = newFilters.status;
    }
    setFilters((prev) => ({ ...prev, ...parsedFilters }));
  };

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }));
  };

  return (
    <div className="py-10 px-6">
      <Tabs defaultValue="zones" className="w-full">
        <TabsList>
          <TabsTrigger value="zones">{t("zones.title") || "Zones"}</TabsTrigger>
          <TabsTrigger value="cities">
            {t("table.city") || "Cities"}
          </TabsTrigger>
          <TabsTrigger value="districts">
            {t("table.district") || "Districts"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zones" className="mt-6">
          <DataTable
            columns={columns()}
            data={zones ? zones.zones : []}
            enableFiltering={true}
            filterConfigs={filterConfigs}
            enableGlobalSearch={true}
            onRowClick={handleRowClick}
            searchPlaceholder={t("table.search", "zone.title") + "..."}
            serverSide={true}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            isLoading={zonesLoading}
          />
        </TabsContent>

        <TabsContent value="cities" className="mt-6">
          <DataTable
            columns={createCitiesColumns()}
            data={cities ? cities.cities : []}
            enableGlobalSearch={true}
            searchPlaceholder={
              t("table.search") + " " + t("table.city") + "..."
            }
            isLoading={citiesLoading}
          />
        </TabsContent>

        <TabsContent value="districts" className="mt-6">
          <DataTable
            columns={createDistrictsColumns()}
            data={districts ? districts.districts : []}
            enableGlobalSearch={true}
            searchPlaceholder={
              t("table.search") + " " + t("table.district") + "..."
            }
            isLoading={districtsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
