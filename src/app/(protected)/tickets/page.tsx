"use client";

import { useState } from "react";
import { Columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetTickets } from "@/lib/hooks/useTicket";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { TicketsQuery } from "@/lib/schema/tickets.schema";

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
    <div className="w-full py-10 px-6">
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
    </div>
  );
}
