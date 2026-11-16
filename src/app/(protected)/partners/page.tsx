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
import { PageContainer } from "@/components/PageContainer";
import { StatsCards, percentOf, statusCount } from "@/components/StatsCards";
import { CircleCheck, CirclePause, Clock, Handshake } from "lucide-react";

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
    <PageContainer size="xl" className="px-6 py-10">
      <StatsCards
        stats={partners?.stats}
        isLoading={isLoading}
        items={(s) => [
          {
            label: t("stats.totalOf", { name: t("partners.title") }),
            value: s.total,
            description: t("stats.newThisMonth", { count: s.new_this_month }),
            icon: Handshake,
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
            label: t("stats.pending"),
            value: statusCount(s, "pending"),
            description: t("stats.ofTotal", {
              percent: percentOf(statusCount(s, "pending"), s.total),
            }),
            icon: Clock,
            tone: "info",
          },
        ]}
      />
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
    </PageContainer>
  );
}
