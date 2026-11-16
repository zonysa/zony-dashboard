"use client";

import { columns } from "@/components/tables/columns/customer-service-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetUsers } from "@/lib/hooks/useUsers";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useState } from "react";
import { userFilterOptions } from "@/lib/schema/user.schema";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { Headset, UserCheck, UserX } from "lucide-react";

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
    <PageContainer size="xl" className="py-10 px-6">
      <StatsCards
        stats={users?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("customerService.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: Headset,
          },
          {
            label: t("stats.active"),
            value: statusCount(s, "active"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "active"), s.total),
            }),
            icon: UserCheck,
            tone: "success",
          },
          {
            label: t("stats.inactive"),
            value: statusCount(s, "inactive"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "inactive"), s.total),
            }),
            icon: UserX,
            tone: "warning",
          },
        ]}
      />
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
    </PageContainer>
  );
}
