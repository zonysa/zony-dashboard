"use client";

import { format, startOfMonth, startOfWeek } from "date-fns";
import { CalendarDays } from "lucide-react";

import { DateRangePicker, type DateRange } from "@/components/ui/date-range-picker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";

export type Period = "today" | "week" | "month" | "custom" | "all";

const PERIODS: Period[] = ["today", "week", "month", "custom", "all"];

/**
 * The calendar days (`yyyy-MM-dd`, inclusive) a period covers, in the
 * browser's local time — the backend compares against Riyadh wall-clock
 * days, which is what staff in Saudi Arabia have on their machines.
 *
 * Weeks start on Sunday, the Saudi working week. "This week"/"this month"
 * run up to today rather than to the end of the period: nothing is created
 * in the future, and the label then reads as the range actually counted.
 * A custom range with no start, and "all", are unbounded.
 */
export function periodRange(
  period: Period,
  custom?: DateRange,
  now: Date = new Date(),
): { start?: string; end?: string } {
  const day = (d: Date) => format(d, "yyyy-MM-dd");
  switch (period) {
    case "today":
      return { start: day(now), end: day(now) };
    case "week":
      return { start: day(startOfWeek(now, { weekStartsOn: 0 })), end: day(now) };
    case "month":
      return { start: day(startOfMonth(now)), end: day(now) };
    case "custom":
      if (!custom?.from) return {};
      return { start: day(custom.from), end: day(custom.to ?? custom.from) };
    case "all":
      return {};
  }
}

interface PeriodFilterProps {
  period: Period;
  onPeriodChange: (period: Period) => void;
  customRange?: DateRange;
  onCustomRangeChange: (range: DateRange | undefined) => void;
  className?: string;
}

/** Today / This week / This month / Custom / All, with a range picker for Custom. */
export function PeriodFilter({
  period,
  onPeriodChange,
  customRange,
  onCustomRangeChange,
  className,
}: PeriodFilterProps) {
  const { t, isRTL } = useTranslation();

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <CalendarDays className="text-muted-foreground size-4 shrink-0" />
      <div className="max-w-full overflow-x-auto">
        <ToggleGroup
          type="single"
          variant="outline"
          dir={isRTL ? "rtl" : "ltr"}
          value={period}
          // Radix reports "" when the active item is clicked again; a period
          // filter always has a value, so ignore that instead of clearing.
          onValueChange={(value) => value && onPeriodChange(value as Period)}
        >
          {PERIODS.map((p) => (
            <ToggleGroupItem key={p} value={p} className="px-3 whitespace-nowrap">
              {t(`period.${p}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      {period === "custom" && (
        <DateRangePicker
          range={customRange}
          onSelect={onCustomRangeChange}
          placeholder={t("period.pickRange")}
          className="w-full sm:w-64"
        />
      )}
    </div>
  );
}
