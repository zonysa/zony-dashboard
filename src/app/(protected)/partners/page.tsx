"use client";

import { columns } from "@/components/tables/columns/partners-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetPartners } from "@/lib/hooks/usePartner";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PartnerDetails, partnerFilterOptions } from "@/lib/schema/partner.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  const [filters, setFilters] = useState<partnerFilterOptions>({
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: partners, isLoading } = useGetPartners({
    ...filters,
    search: debouncedSearch,
  });

  const filterConfigs = [
    { key: "type", label: t("table.type"), placeholder: t("table.allTypes") },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const handleRowClick = (row: Row<PartnerDetails>) => {
    const partnerId = row.getValue("id");
    router.replace(`/partners/${partnerId}`);
  };

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      type: newFilters.type || undefined,
      status: newFilters.status || undefined,
    }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
  };

  return (
    <div className="px-6 py-10">
      <DataTable
        columns={columns()}
        data={partners ? partners.partners : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search", "table.partners")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </div>
  );
}
