"use client";

import { useState } from "react";
import { Columns } from "@/components/tables/columns/parcels-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetParcels } from "@/lib/hooks/useParcel";
import { ParcelDetails, parcelFilterOptions } from "@/lib/schema/parcel.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  // Filter state management
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Build query object
  const query: parcelFilterOptions = {
    page: 1,
    limit: 50,
    search: debouncedSearch,
    client: filters.client_name,
    city: filters.city_name,
    zone: filters.zone_name,
    status: filters.status,
  };

  // Fetch parcels with query
  const { data: parcels, isLoading } = useGetParcels(query);

  const filterConfigs = [
    { key: "date", label: t("table.date"), placeholder: t("table.date") },
    {
      key: "client_name",
      label: t("table.client"),
      placeholder: t("table.allClients"),
    },
    {
      key: "city_name",
      label: t("table.city"),
      placeholder: t("table.allCities"),
    },
    {
      key: "zone_name",
      label: t("table.zone"),
      placeholder: t("table.allZones"),
    },
  ];

  const handleRowClick = (row: Row<ParcelDetails>) => {
    const parcelId = row.getValue("id") as string;
    router.replace(`/parcels/${parcelId}`);
  };

  return (
    <div className="py-10 px-6">
      <DataTable
        columns={Columns({ t })}
        data={parcels?.parcels || []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("parcels.searchPlaceholder")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={setFilters}
        onSearchChange={setSearch}
        isLoading={isLoading}
      />
    </div>
  );
}
