"use client";

import { columns } from "@/components/tables/columns/customer-service-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useState } from "react";
import { userFilterOptions } from "@/lib/schema/user.schema";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function Page() {
  const { t } = useTranslation();

  const [filters, setFilters] = useState<userFilterOptions>({
    role_id: 5,
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: users, isLoading } = useGetUsers({
    ...filters,
    search: debouncedSearch,
  });

  const filterConfigs = [
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
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
        data={users ? users.users : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search", "table.customerService")}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </div>
  );
}
