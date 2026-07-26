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
import { useDebounce } from "@/lib/hooks/useDebounce";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/PageContainer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Page() {
  const [filters, setFilters] = useState<GetZonesFilter>({});
  const { data: zones, isLoading: zonesLoading } = useGetZones(filters);

  // Unfiltered lists, used to populate the city/district filter dropdowns on the Zones tab
  const { data: cities } = useGetCities();
  const { data: districts } = useGetDistricts();

  const [citiesSearch, setCitiesSearch] = useState("");
  const debouncedCitiesSearch = useDebounce(citiesSearch, 400);
  const { data: citiesList, isLoading: citiesLoading } = useGetCities({
    search: debouncedCitiesSearch,
  });

  const [districtsSearch, setDistrictsSearch] = useState("");
  const debouncedDistrictsSearch = useDebounce(districtsSearch, 400);
  const { data: districtsList, isLoading: districtsLoading } = useGetDistricts(
    undefined,
    { search: debouncedDistrictsSearch }
  );

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
    <PageContainer size="xl" className="py-10 px-6">
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

        <TabsContent value="cities" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("table.search") + " " + t("table.city") + "..."}
              value={citiesSearch}
              onChange={(e) => setCitiesSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {debouncedCitiesSearch && citiesList?.total_cities === 0 ? (
            <div className="rounded-md border h-24 flex items-center justify-center text-sm text-gray-600">
              {t("table.noResultsForSearch", { term: debouncedCitiesSearch })}
            </div>
          ) : (
            <DataTable
              columns={createCitiesColumns()}
              data={citiesList ? citiesList.cities : []}
              isLoading={citiesLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="districts" className="mt-6 space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={
                t("table.search") + " " + t("table.district") + "..."
              }
              value={districtsSearch}
              onChange={(e) => setDistrictsSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {debouncedDistrictsSearch && districtsList?.total_districts === 0 ? (
            <div className="rounded-md border h-24 flex items-center justify-center text-sm text-gray-600">
              {t("table.noResultsForSearch", {
                term: debouncedDistrictsSearch,
              })}
            </div>
          ) : (
            <DataTable
              columns={createDistrictsColumns()}
              data={districtsList ? districtsList.districts : []}
              isLoading={districtsLoading}
            />
          )}
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
