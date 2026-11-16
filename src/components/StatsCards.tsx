"use client";

import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ListStats } from "@/lib/schema/api.types";

export type StatTone = "default" | "success" | "warning" | "danger" | "info";

export interface StatItem {
  label: string;
  value: number | string;
  description?: string;
  icon?: LucideIcon;
  tone?: StatTone;
}

const toneClasses: Record<StatTone, string> = {
  default: "bg-muted text-foreground",
  success:
    "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
  danger: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
};

const numberFormat = new Intl.NumberFormat("en-US");

const EMPTY_STATS: ListStats = { total: 0, new_this_month: 0 };

interface StatsCardsProps {
  /** The `stats` object from a list response. */
  stats: ListStats | undefined;
  /** The list query's loading flag. */
  isLoading?: boolean;
  /** Builds the cards from the stats; called with zeros for the skeleton. */
  items: (stats: ListStats) => StatItem[];
  className?: string;
}

/**
 * The row of summary cards above a list page's table, fed by the `stats`
 * object the backend returns alongside every list (see `ListStats`).
 *
 * Holds on to the last stats it was given: searching or filtering the table
 * changes the query key, and the cards (which ignore those filters
 * server-side) shouldn't blank out while the next page loads. Renders nothing
 * if the list loaded without stats, e.g. against an older backend.
 */
export function StatsCards({
  stats: incoming,
  isLoading,
  items,
  className,
}: StatsCardsProps) {
  const [held, setHeld] = useState(incoming);
  useEffect(() => {
    if (incoming) setHeld(incoming);
  }, [incoming]);
  const stats = incoming ?? held;

  if (!stats && !isLoading) return null;

  const cards = items(stats ?? EMPTY_STATS);
  const cols =
    cards.length >= 4
      ? "lg:grid-cols-4"
      : cards.length === 3
        ? "lg:grid-cols-3"
        : "lg:grid-cols-2";

  return (
    <div className={cn("mb-6 grid grid-cols-2 gap-4", cols, className)}>
      {cards.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="gap-2 px-5 py-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm font-medium">
                {item.label}
              </span>
              {Icon && (
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    toneClasses[item.tone ?? "default"],
                  )}
                >
                  <Icon className="size-4" />
                </span>
              )}
            </div>
            {!stats ? (
              <>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-24" />
              </>
            ) : (
              <>
                <span className="text-2xl font-semibold tabular-nums">
                  {typeof item.value === "number"
                    ? numberFormat.format(item.value)
                    : item.value}
                </span>
                {item.description && (
                  <span className="text-muted-foreground text-xs">
                    {item.description}
                  </span>
                )}
              </>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/** Count for one status, matched case-insensitively (the backend lower-cases). */
export function statusCount(stats: ListStats, status: string) {
  return stats.by_status?.[status.toLowerCase()] ?? 0;
}

/** Whole-number share of `total`, 0 when there's nothing to divide by. */
export function percentOf(part: number, total: number) {
  return total ? Math.round((part / total) * 100) : 0;
}
