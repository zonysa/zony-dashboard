"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCards } from "@/components/ui/section-cards";
import { useGetKPIEvaluations } from "@/lib/hooks/useKpi";
import { KPIEvaluationItem } from "@/lib/schema/kpi.schema";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/useTranslation";

// KPI category mapping based on kpi_id
// Core Financial: 1-4
// Operational Performance: 5-8
// Customer & Market: 9-12
// Quality & Satisfaction: 13+ (if any)
const KPI_CATEGORIES: Record<string, readonly number[]> = {
  "core-financial": [1, 2, 3, 4],
  "operational-performance": [5, 6, 7, 8],
  "customer-market": [9, 10, 11, 12],
  "quality-satisfaction": [13, 14, 15, 16],
};

type CategoryKey = keyof typeof KPI_CATEGORIES;

function filterKPIsByCategory(
  evaluations: KPIEvaluationItem[] | undefined,
  category: CategoryKey
): KPIEvaluationItem[] {
  if (!evaluations) return [];
  const categoryIds = KPI_CATEGORIES[category];
  return evaluations.filter((kpi) => categoryIds.includes(kpi.kpi_id));
}

function ReportsAnalyticsPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch, isRefetching } =
    useGetKPIEvaluations();

  // Memoize filtered KPIs for each category
  const coreFinancialKPIs = useMemo(
    () => filterKPIsByCategory(data?.evaluations, "core-financial"),
    [data?.evaluations]
  );

  const operationalKPIs = useMemo(
    () => filterKPIsByCategory(data?.evaluations, "operational-performance"),
    [data?.evaluations]
  );

  const customerMarketKPIs = useMemo(
    () => filterKPIsByCategory(data?.evaluations, "customer-market"),
    [data?.evaluations]
  );

  const qualitySatisfactionKPIs = useMemo(
    () => filterKPIsByCategory(data?.evaluations, "quality-satisfaction"),
    [data?.evaluations]
  );

  // Error state
  if (error) {
    return (
      <div className="flex w-full justify-center items-center flex-col gap-4 py-20">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold text-gray-700">
          {t("reports.loadFailed")}
        </h2>
        <p className="text-gray-500">{error.message}</p>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 me-2" />
          {t("reports.retry")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center align-top flex-col gap-6 py-10">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center px-6">
        <h1 className="text-2xl font-semibold">{t("reports.title")}</h1>
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          disabled={isRefetching}
        >
          <RefreshCw
            className={`w-4 h-4 me-2 ${isRefetching ? "animate-spin" : ""}`}
          />
          {t("reports.refresh")}
        </Button>
      </div>

      <Tabs defaultValue="core-financial" className="w-full gap-6">
        <TabsList className="px-6 bg-transparent">
          <div className="w-full flex justify-start bg-gray-50 px-2 py-2 gap-2 rounded-[10px]">
            <TabsTrigger value="core-financial">
              {t("reports.categories.coreFinancial")}
            </TabsTrigger>
            <TabsTrigger value="operational-performance">
              {t("reports.categories.operationalPerformance")}
            </TabsTrigger>
            <TabsTrigger value="customer-market">
              {t("reports.categories.customerMarket")}
            </TabsTrigger>
            <TabsTrigger value="quality-satisfaction">
              {t("reports.categories.qualitySatisfaction")}
            </TabsTrigger>
          </div>
        </TabsList>

        <TabsContent className="w-full" value="core-financial">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards kpis={coreFinancialKPIs} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="operational-performance">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards kpis={operationalKPIs} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="customer-market">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards kpis={customerMarketKPIs} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>

        <TabsContent className="w-full" value="quality-satisfaction">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                kpis={qualitySatisfactionKPIs}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ReportsAnalyticsPage;
