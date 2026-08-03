"use client";

import { Suspense, useMemo } from "react";
import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfDay,
  subDays,
} from "date-fns";
import { Download, Info } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { Matcher } from "react-day-picker";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useExportEventsCsv,
  useExportParcelsCsv,
  useGetReport,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { WarehouseReportRange } from "@/lib/schema/warehouse.schema";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// docs/warehouse-api.md §4.1: "start and end are mandatory and the span is
// capped at 92 days — an unbounded query full-scans wh_events. A missing or
// over-long range returns 400." Enforced here via DatePicker disabled dates,
// not by letting the request round-trip and fail.
const REPORT_MAX_SPAN_DAYS = 92;

function toDateStr(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function parseDateStr(value: string) {
  return startOfDay(parse(value, "yyyy-MM-dd", new Date()));
}

function defaultRange(): WarehouseReportRange {
  const end = startOfDay(new Date());
  const start = subDays(end, 29);
  return { start: toDateStr(start), end: toDateStr(end) };
}

function clampRange(rawStart: string, rawEnd: string): WarehouseReportRange {
  const today = startOfDay(new Date());
  let start = parseDateStr(rawStart);
  let end = parseDateStr(rawEnd);
  if (end > today) end = today;
  if (start > end) start = end;
  if (differenceInCalendarDays(end, start) > REPORT_MAX_SPAN_DAYS) {
    start = addDays(end, -REPORT_MAX_SPAN_DAYS);
  }
  return { start: toDateStr(start), end: toDateStr(end) };
}

function formatMinutes(minutes: number): string {
  if (!Number.isFinite(minutes)) return "—";
  const total = Math.round(minutes);
  const days = Math.floor(total / 1440);
  const hours = Math.floor((total % 1440) / 60);
  const mins = total % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export default function WarehouseReportPage() {
  return (
    <Suspense fallback={<ReportSkeleton />}>
      <WarehouseReportPageContent />
    </Suspense>
  );
}

function ReportSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function WarehouseReportPageContent() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");
  const range: WarehouseReportRange =
    startParam && endParam && DATE_RE.test(startParam) && DATE_RE.test(endParam)
      ? clampRange(startParam, endParam)
      : defaultRange();

  const { data, isLoading, isError } = useGetReport(range);
  const exportEvents = useExportEventsCsv();
  const exportParcels = useExportParcelsCsv();

  const startDate = parseDateStr(range.start);
  const endDate = parseDateStr(range.end);
  const today = startOfDay(new Date());

  // Bidirectional cap: whichever side the user is about to move, the other
  // side's committed value plus REPORT_MAX_SPAN_DAYS bounds it, and neither
  // side may land in the future.
  const startDisabled: Matcher[] = [
    { after: endDate < today ? endDate : today },
    { before: addDays(endDate, -REPORT_MAX_SPAN_DAYS) },
  ];
  const endCeiling = addDays(startDate, REPORT_MAX_SPAN_DAYS);
  const endDisabled: Matcher[] = [
    { before: startDate },
    { after: endCeiling < today ? endCeiling : today },
  ];

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.replace(`${pathname}?${params.toString()}`);
  }

  function handleStartSelect(newDate: Date | undefined) {
    if (!newDate) return;
    updateParam("start", toDateStr(newDate));
  }

  function handleEndSelect(newDate: Date | undefined) {
    if (!newDate) return;
    updateParam("end", toDateStr(newDate));
  }

  const interacted = data?.by_customer_interaction.find(
    (row) => row.customer_interacted === 1,
  );
  const notInteracted = data?.by_customer_interaction.find(
    (row) => row.customer_interacted === 0,
  );

  const failureChartData = useMemo(
    () =>
      [...(data?.failure_reasons ?? [])]
        .sort((a, b) => b.count - a.count)
        .map((reason) => ({
          name: isRTL ? reason.name_ar : reason.name_en,
          count: reason.count,
        })),
    [data?.failure_reasons, isRTL],
  );

  const dwellHistogramData = useMemo(
    () =>
      Object.entries(data?.dwell_time.histogram ?? {}).map(([bucket, count]) => ({
        bucket,
        count,
      })),
    [data?.dwell_time.histogram],
  );

  const barChartConfig: ChartConfig = {
    count: {
      label: t("warehouseReport.chart.count"),
      color: "var(--chart-1)",
    },
  };

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseReport.title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("warehouseReport.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("warehouseReport.range.start")}
            </label>
            <DatePicker
              date={startDate}
              onSelect={handleStartSelect}
              disabledDates={startDisabled}
              placeholder={t("warehouseReport.range.startPlaceholder")}
            />
          </div>
          <div className="w-44">
            <label className="mb-1 block text-xs font-medium text-muted-foreground">
              {t("warehouseReport.range.end")}
            </label>
            <DatePicker
              date={endDate}
              onSelect={handleEndSelect}
              disabledDates={endDisabled}
              placeholder={t("warehouseReport.range.endPlaceholder")}
            />
          </div>
          <Can do={Permission.EXPORT_WAREHOUSE_REPORTS}>
            <Button
              type="button"
              variant="outline"
              disabled={exportEvents.isPending}
              onClick={() => exportEvents.mutate(range)}
            >
              <Download className="h-3.5 w-3.5" />
              {exportEvents.isPending
                ? t("warehouseReport.actions.exporting")
                : t("warehouseReport.actions.exportEvents")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exportParcels.isPending}
              onClick={() => exportParcels.mutate(range)}
            >
              <Download className="h-3.5 w-3.5" />
              {exportParcels.isPending
                ? t("warehouseReport.actions.exporting")
                : t("warehouseReport.actions.exportParcels")}
            </Button>
          </Can>
        </div>
      </div>

      <p className="mb-6 text-xs text-muted-foreground">{t("warehouseReport.range.capNotice")}</p>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseReport.loadError")}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        data && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("warehouseReport.volume.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <StatTile
                  label={t("warehouseReport.volume.received")}
                  value={data.volume_and_success.parcels_received.toLocaleString()}
                  muted
                />
                <StatTile
                  label={t("warehouseReport.volume.attempted")}
                  hint={t("warehouseReport.volume.attemptedHint")}
                  value={data.volume_and_success.parcels_attempted.toLocaleString()}
                />
                <StatTile
                  label={t("warehouseReport.volume.success")}
                  value={data.volume_and_success.first_attempt_success.toLocaleString()}
                />
                <StatTile
                  label={t("warehouseReport.volume.successRate")}
                  value={formatPercent(data.volume_and_success.first_attempt_success_rate)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("warehouseReport.interaction.title")}</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="grid grid-cols-2 gap-4 lg:col-span-2">
                  <StatTile
                    label={t("warehouseReport.interaction.interacted")}
                    value={
                      interacted
                        ? formatPercent(interacted.first_attempt_success_rate)
                        : "—"
                    }
                    hint={
                      interacted
                        ? t("warehouseReport.interaction.attempted", {
                            count: interacted.parcels_attempted,
                          })
                        : undefined
                    }
                  />
                  <StatTile
                    label={t("warehouseReport.interaction.notInteracted")}
                    value={
                      notInteracted
                        ? formatPercent(notInteracted.first_attempt_success_rate)
                        : "—"
                    }
                    hint={
                      notInteracted
                        ? t("warehouseReport.interaction.attempted", {
                            count: notInteracted.parcels_attempted,
                          })
                        : undefined
                    }
                  />
                </div>
                <div className="flex gap-2 rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                  <Info className="h-4 w-4 shrink-0 translate-y-0.5" />
                  <p>{data.caveat}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("warehouseReport.failureReasons.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {failureChartData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("warehouseReport.failureReasons.empty")}
                  </p>
                ) : (
                  <ChartContainer config={barChartConfig} className="h-64 w-full">
                    <BarChart
                      data={failureChartData}
                      layout="vertical"
                      margin={{ left: 12 }}
                    >
                      <CartesianGrid horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tickLine={false}
                        axisLine={false}
                        width={140}
                      />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("warehouseReport.dwell.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                  <StatTile
                    label={t("warehouseReport.dwell.median")}
                    value={formatMinutes(data.dwell_time.median_minutes)}
                  />
                  <StatTile
                    label={t("warehouseReport.dwell.p90")}
                    value={formatMinutes(data.dwell_time.p90_minutes)}
                  />
                  <StatTile
                    label={t("warehouseReport.dwell.mean")}
                    value={formatMinutes(data.dwell_time.avg_minutes)}
                    muted
                  />
                  <StatTile
                    label={t("warehouseReport.dwell.parcels")}
                    value={data.dwell_time.parcels.toLocaleString()}
                    muted
                  />
                </div>

                {dwellHistogramData.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("warehouseReport.dwell.empty")}
                  </p>
                ) : (
                  <ChartContainer config={barChartConfig} className="h-64 w-full">
                    <BarChart data={dwellHistogramData}>
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="bucket"
                        tickLine={false}
                        axisLine={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("warehouseReport.messages.title")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {t("warehouseReport.messages.stubNote")}
                </p>
                {!data.messages.by_channel.length ? (
                  <p className="text-sm text-muted-foreground">
                    {t("warehouseReport.messages.empty")}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("warehouseReport.messages.channel")}</TableHead>
                        <TableHead className="text-end">
                          {t("warehouseReport.messages.total")}
                        </TableHead>
                        <TableHead className="text-end">
                          {t("warehouseReport.messages.failed")}
                        </TableHead>
                        <TableHead className="text-end">
                          {t("warehouseReport.messages.fallbacks")}
                        </TableHead>
                        <TableHead className="text-end">
                          {t("warehouseReport.messages.responded")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.messages.by_channel.map((row) => (
                        <TableRow key={row.channel}>
                          <TableCell className="font-medium capitalize">
                            {row.channel}
                          </TableCell>
                          <TableCell className="text-end tabular-nums">
                            {row.total.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-end tabular-nums">
                            {row.failed.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-end tabular-nums">
                            {row.fallbacks.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-end tabular-nums">
                            {row.responded.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )
      )}
    </PageContainer>
  );
}

function StatTile({
  label,
  value,
  hint,
  muted,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={muted ? "text-xl font-medium text-muted-foreground" : "text-2xl font-semibold"}>
        {value}
      </p>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
