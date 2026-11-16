"use client";

import { useState } from "react";
import { Columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetTickets } from "@/lib/hooks/useTicket";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TicketsQuery } from "@/lib/schema/tickets.schema";
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { CircleCheck, CircleDot, LifeBuoy, Loader } from "lucide-react";

export default function Page() {
  const { t } = useTranslation();

  // Filter state management
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  // Build query object
  const query: Partial<TicketsQuery> = {
    page: 1,
    limit: 50,
    search: debouncedSearch,
    filters: filters,
  };

  // Fetch tickets with query
  const { data: tickets, isLoading } = useGetTickets(query);

  const filterConfigs = [
    {
      key: "pudo_name",
      label: t("table.pudo"),
      placeholder: t("table.allPUDOs"),
    },
    {
      key: "zone_name",
      label: t("table.zoneName"),
      placeholder: t("table.allZones"),
    },
    {
      key: "action_taken",
      label: t("table.actionTaken"),
      placeholder: t("table.allActions"),
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
    {
      key: "rating",
      label: t("table.rating"),
      placeholder: t("table.allRatings"),
    },
  ];

  return (
    <PageContainer size="xl" className="py-10 px-6">
      <StatsCards
        stats={tickets?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("tickets.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: LifeBuoy,
          },
          {
            label: t("stats.open"),
            value: statusCount(s, "open"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "open"), s.total),
            }),
            icon: CircleDot,
            tone: "danger",
          },
          {
            label: t("stats.inProgress"),
            value: statusCount(s, "in_progress"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "in_progress"), s.total),
            }),
            icon: Loader,
            tone: "info",
          },
          {
            label: t("stats.resolved"),
            value: statusCount(s, "resolved"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "resolved"), s.total),
            }),
            icon: CircleCheck,
            tone: "success",
          },
        ]}
      />
      <DataTable
        columns={Columns({ t })}
        data={tickets?.tickets ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.searchTick")}
        serverSide={true}
        onFilterChange={setFilters}
        onSearchChange={setSearch}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
