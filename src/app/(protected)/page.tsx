"use client";

import { Columns } from "@/components/tables/columns/tickets-columns";
import { DataTable } from "@/components/tables/data-table";
import { SectionCards } from "@/components/ui/section-cards";
import { SidebarInset } from "@/components/ui/sidebar";
import { useGetKPIEvaluations } from "@/lib/hooks/useKpi";
import { useGetTickets } from "@/lib/hooks/useTicket";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PageContainer } from "@/components/PageContainer";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getHomeRoute } from "@/lib/rbac/roles";

export default function Page() {
  const role = useAuthStore((state) => state.user?.role);
  const home = getHomeRoute(role);
  const router = useRouter();

  // A role with its own home (a warehouse clerk's warehouse) never sees the
  // platform overview — sent there from links to "/", Access Denied's button,
  // the 404 page and old bookmarks alike.
  useEffect(() => {
    if (home !== "/") router.replace(home);
  }, [home, router]);

  if (home !== "/") return null;

  return <Overview />;
}

function Overview() {
  const { data, isLoading } = useGetKPIEvaluations();
  const { data: tickets } = useGetTickets();
  const { t } = useTranslation();

  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <PageContainer size="xl" className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
          </PageContainer>
        </div>
      </div>
    </SidebarInset>
  );
}
