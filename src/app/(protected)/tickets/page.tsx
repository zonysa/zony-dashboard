"use client";

import { columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { useGetTickets } from "@/lib/hooks/useTicket";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { data: tickets } = useGetTickets();
  const { t } = useTranslation();

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
        columns={columns()}
        data={tickets?.tickets ?? []}
        enableFiltering={true}
        filterConfigs={filterConfigs}
        enableGlobalSearch={true}
        searchPlaceholder={t("table.searchTick")}
      />
    </div>
  );
}
