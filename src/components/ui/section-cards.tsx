import { IconAlertCircle } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  KPIEvaluationItem,
  isKPIEvaluationError,
  KPIZone,
} from "@/lib/schema/kpi.schema";
import { Skeleton } from "@/components/ui/skeleton";

interface SectionCardsProps {
  kpis: KPIEvaluationItem[];
  isLoading?: boolean;
}

// Get zone badge variant and styles
const getZoneStyles = (zone: KPIZone) => {
  switch (zone) {
    case "green":
      return {
        badgeClass: "bg-green-100 text-green-700 border-green-200",
        cardClass: "border-l-4 border-l-green-500",
      };
    case "yellow":
      return {
        badgeClass: "bg-yellow-100 text-yellow-700 border-yellow-200",
        cardClass: "border-l-4 border-l-yellow-500",
      };
    case "red":
      return {
        badgeClass: "bg-red-100 text-red-700 border-red-200",
        cardClass: "border-l-4 border-l-red-500",
      };
    default:
      return {
        badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
        cardClass: "",
      };
  }
};

// Format value based on unit
const formatValue = (value: number, unit: string) => {
  if (unit === "SAR") {
    return new Intl.NumberFormat("en-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (unit === "%") {
    return `${value}%`;
  }
  return new Intl.NumberFormat("en-US").format(value);
};

// Translate zone to Arabic
const getZoneLabel = (zone: KPIZone) => {
  switch (zone) {
    case "green":
      return "جيد";
    case "yellow":
      return "تحذير";
    case "red":
      return "حرج";
    default:
      return zone;
  }
};

export function SectionCards({ kpis, isLoading }: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!kpis || kpis.length === 0) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="@container/card">
          <CardHeader className="text-center py-8">
            <CardDescription>لا توجد بيانات متاحة</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {kpis.map((kpi) => {
        // Handle error case
        if (isKPIEvaluationError(kpi)) {
          return (
            <Card
              key={kpi.kpi_id}
              className="@container/card border-l-4 border-l-gray-400"
            >
              <CardHeader>
                <CardDescription>{kpi.kpi_name}</CardDescription>
                <CardTitle className="text-lg font-medium text-gray-500 flex items-center gap-2">
                  <IconAlertCircle className="size-5 text-gray-400" />
                  غير متاح
                </CardTitle>
                <CardAction>
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-600 border-gray-200"
                  >
                    خطأ
                  </Badge>
                </CardAction>
              </CardHeader>
            </Card>
          );
        }

        // Success case
        const styles = getZoneStyles(kpi.zone);

        return (
          <Card
            key={kpi.kpi_id}
            className={`@container/card ${styles.cardClass}`}
          >
            <CardHeader>
              <CardDescription>{kpi.kpi_name}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {formatValue(kpi.current_value, kpi.unit)}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className={styles.badgeClass}>
                  {getZoneLabel(kpi.zone)}
                </Badge>
              </CardAction>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
