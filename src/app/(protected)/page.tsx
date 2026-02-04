"use client";

import { Columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { SectionCards } from "@/components/ui/section-cards";
import { SidebarInset } from "@/components/ui/sidebar";
import { useGetKPIEvaluations } from "@/lib/hooks/useKpi";
import { useGetTickets } from "@/lib/hooks/useTicket";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function Page() {
  const { data, isLoading } = useGetKPIEvaluations();
  const { data: tickets } = useGetTickets();
  const { t } = useTranslation();

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards
              kpis={data?.evaluations || []}
              isLoading={isLoading}
            />
            <div className="px-4 lg:px-6">
              <DataTable
                columns={Columns({ t })}
                data={tickets?.tickets || []}
                enableFiltering={false}
                enableGlobalSearch={false}
                searchPlaceholder={t("parcels.searchPlaceholder")}
              />
            </div>
          </div>
        </div>
      </div>
    </SidebarInset>
  );
}
