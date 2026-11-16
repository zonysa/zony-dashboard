"use client";

import { columns } from "@/components/tables/columns/clients-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetClients } from "@/lib/hooks/useClient";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Client, ClientFilterOptions } from "@/lib/schema/client.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { Ban, Building2, CircleCheck, CirclePause } from "lucide-react";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  const [filters, setFilters] = useState<ClientFilterOptions>({
    page: 1,
    limit: 50,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: clients, isLoading } = useGetClients({
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

  const handleRowClick = (row: Row<Client>) => {
    const id = row.getValue("id");
    router.replace(`/clients/${id}`);
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
    <PageContainer size="xl" className="px-6 py-10">
      <StatsCards
        stats={clients?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("clients.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: Building2,
          },
          {
            label: t("stats.active"),
            value: statusCount(s, "active"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "active"), s.total),
            }),
            icon: CircleCheck,
            tone: "success",
          },
          {
            label: t("stats.inactive"),
            value: statusCount(s, "inactive"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "inactive"), s.total),
            }),
            icon: CirclePause,
            tone: "warning",
          },
          {
            label: t("stats.suspended"),
            value: statusCount(s, "suspended"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "suspended"), s.total),
            }),
            icon: Ban,
            tone: "danger",
          },
        ]}
      />
      <DataTable
        columns={columns()}
        data={clients ? clients?.clients : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search", "table.clients")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
