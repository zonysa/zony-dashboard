"use client";

import { columns } from "@/components/tables/columns/leads-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetLeads } from "@/lib/hooks/useLead";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Lead, LeadFilterOptions } from "@/lib/schema/lead.schema";
import { Row } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { CircleCheckBig, Inbox, PhoneCall, Sparkles } from "lucide-react";

export default function Page() {
  const { t } = useTranslation();
  const router = useRouter();

  const [filters, setFilters] = useState<LeadFilterOptions>({
    page: 1,
    limit: 20,
  });
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data: leads, isLoading } = useGetLeads({
    ...filters,
    search: debouncedSearch,
  });

  const filterConfigs = [
    {
      key: "source_tab",
      label: t("leads.interestedIn"),
      placeholder: t("leads.allTypes"),
    },
    {
      key: "status",
      label: t("table.status"),
      placeholder: t("table.allStatus"),
    },
  ];

  const handleRowClick = (row: Row<Lead>) => {
    router.push(`/leads/${row.original.id}`);
  };

  // Any change to what is being queried has to send us back to page 1 —
  // staying on page 4 of the old result set would show an empty table.
  const handleFilterChange = (newFilters: Record<string, string>) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      source_tab: newFilters.source_tab || undefined,
      status: newFilters.status || undefined,
    }));
  };

  const handleSearchChange = (searchValue: string) => {
    setSearch(searchValue);
    setFilters((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (pageIndex: number) => {
    setFilters((prev) => ({ ...prev, page: pageIndex + 1 }));
  };

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <StatsCards
        stats={leads?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("leads.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: Inbox,
          },
          {
            label: t("stats.newLeads"),
            value: statusCount(s, "new"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "new"), s.total),
            }),
            icon: Sparkles,
            tone: "info",
          },
          {
            label: t("stats.contacted"),
            value: statusCount(s, "contacted"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "contacted"), s.total),
            }),
            icon: PhoneCall,
            tone: "warning",
          },
          {
            label: t("stats.converted"),
            value: statusCount(s, "converted"),
            description: t("stats.conversionRate", {
              percent: percentOf(statusCount(s, "converted"), s.total),
            }),
            icon: CircleCheckBig,
            tone: "success",
          },
        ]}
      />
      <DataTable
        columns={columns()}
        data={leads ? leads.leads : []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.search")}
        onRowClick={handleRowClick}
        serverSide={true}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        pageCount={leads?.total_pages ?? 0}
        pageIndex={(filters.page ?? 1) - 1}
        onPageChange={handlePageChange}
        totalResults={leads?.total_leads}
        isLoading={isLoading}
      />
    </PageContainer>
  );
}
