"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardCheck,
  Grid3x3,
  Info,
  PackageCheck,
  ScanLine,
  Settings,
  Truck,
  Undo2,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetWall } from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";

function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}

export default function WarehouseHubPage() {
  const { t, isRTL } = useTranslation();
  const date = todayStr();

  // The Wall query already polls every 15s, so the counters below stay live
  // without the hub owning any refresh logic of its own.
  const { data, isLoading, isError } = useGetWall(date);

  // Every figure here is folded from the one Wall response — the module derives
  // status server-side and we never recompute one client-side
  // (docs/warehouse-api.md §1).
  const counts = useMemo(() => {
    const cells = data?.cells ?? [];
    const binned = cells.flatMap((cell) => cell.parcels);
    return {
      awaiting: data?.awaiting_count ?? 0,
      needsRebin: binned.filter((p) => p.status === "needs_rebin").length,
      ready: binned.filter((p) => p.status === "ready_for_dispatch").length,
      onWall: cells.reduce((sum, cell) => sum + cell.count, 0),
    };
  }, [data]);

  const kpis: {
    key: string;
    value: number;
    label: string;
    hint: string;
    href: string;
    accent?: string;
  }[] = [
    {
      key: "awaiting",
      value: counts.awaiting,
      label: t("warehouse.hub.kpi.awaiting"),
      hint: t("warehouse.hub.kpi.awaitingHint"),
      href: "/warehouse/wall",
    },
    {
      key: "needsRebin",
      value: counts.needsRebin,
      label: t("warehouse.hub.kpi.needsRebin"),
      hint: t("warehouse.hub.kpi.needsRebinHint"),
      href: "/warehouse/wall",
      // Same purple the Wall uses for needs_rebin, so the two screens agree.
      accent: "text-purple-700 dark:text-purple-400",
    },
    {
      key: "ready",
      value: counts.ready,
      label: t("warehouse.hub.kpi.ready"),
      hint: t("warehouse.hub.kpi.readyHint"),
      href: "/warehouse/loading",
      accent: "text-emerald-700 dark:text-emerald-400",
    },
    {
      key: "onWall",
      value: counts.onWall,
      label: t("warehouse.hub.kpi.onWall"),
      hint: t("warehouse.hub.kpi.onWallHint"),
      href: "/warehouse/wall",
    },
  ];

  const destinations: {
    key: string;
    href: string;
    icon: LucideIcon;
    title: string;
    description: string;
    code?: string;
    permission: Permission;
  }[] = [
    {
      key: "receiving",
      href: "/warehouse/receiving",
      icon: ScanLine,
      title: t("warehouse.hub.cards.receiving"),
      description: t("warehouse.hub.cards.receivingDesc"),
      code: "E01",
      permission: Permission.VIEW_WAREHOUSE,
    },
    {
      key: "wall",
      href: "/warehouse/wall",
      icon: Grid3x3,
      title: t("warehouse.hub.cards.wall"),
      description: t("warehouse.hub.cards.wallDesc"),
      code: "E02",
      permission: Permission.VIEW_WAREHOUSE,
    },
    {
      key: "loading",
      href: "/warehouse/loading",
      icon: Truck,
      title: t("warehouse.hub.cards.loading"),
      description: t("warehouse.hub.cards.loadingDesc"),
      code: "E04",
      permission: Permission.VIEW_WAREHOUSE,
    },
    {
      key: "return",
      href: "/warehouse/return",
      icon: Undo2,
      title: t("warehouse.hub.cards.return"),
      description: t("warehouse.hub.cards.returnDesc"),
      code: "E07",
      permission: Permission.VIEW_WAREHOUSE,
    },
    {
      key: "report",
      href: "/warehouse/report",
      icon: BarChart3,
      title: t("warehouse.hub.cards.report"),
      description: t("warehouse.hub.cards.reportDesc"),
      permission: Permission.VIEW_WAREHOUSE_REPORTS,
    },
    {
      key: "settings",
      // Lives under the platform's /settings section, not this one — the card
      // stays here because it's still where an operator looks for it.
      href: "/settings/warehouse",
      icon: Settings,
      title: t("warehouse.hub.cards.settings"),
      description: t("warehouse.hub.cards.settingsDesc"),
      permission: Permission.VIEW_WAREHOUSE_SETTINGS,
    },
  ];

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-foreground">{t("warehouse.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("warehouse.subtitle")}</p>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouse.loadError")}
        </div>
      )}

      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {t("warehouse.hub.today", { date: format(new Date(), "d MMM yyyy") })}
      </p>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) =>
          isLoading ? (
            <Skeleton key={kpi.key} className="h-28 w-full rounded-xl" />
          ) : (
            <Link
              key={kpi.key}
              href={kpi.href}
              className="group rounded-xl border bg-card p-4 transition-colors hover:bg-accent"
            >
              <div className={cn("text-3xl font-semibold tabular-nums", kpi.accent)}>
                {kpi.value}
              </div>
              <div className="mt-1 text-sm font-medium text-foreground">{kpi.label}</div>
              <p className="mt-1 text-xs leading-snug text-muted-foreground">{kpi.hint}</p>
            </Link>
          ),
        )}
      </div>

      <LifecycleStrip />

      <h2 className="mb-3 mt-8 text-sm font-medium text-foreground">
        {t("warehouse.hub.cards.title")}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {destinations.map((dest) => (
          <Can key={dest.key} do={dest.permission}>
            <Link href={dest.href} className="group block h-full">
              <Card className="h-full transition-colors group-hover:border-primary/40 group-hover:bg-accent/40">
                <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground group-hover:text-foreground">
                      <dest.icon className="h-4 w-4" />
                    </span>
                    <CardTitle className="text-base">{dest.title}</CardTitle>
                  </div>
                  {dest.code && (
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {dest.code}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-snug text-muted-foreground">{dest.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    {dest.title}
                    <ArrowRight className={cn("h-3 w-3", isRTL && "rotate-180")} />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </Can>
        ))}
      </div>

      <div className="mt-8 flex gap-3 rounded-lg border bg-muted/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium text-foreground">{t("warehouse.hub.note.title")}</p>
          <p className="mt-1 text-sm leading-snug text-muted-foreground">
            {t("warehouse.hub.note.body")}
          </p>
        </div>
      </div>
    </PageContainer>
  );
}

/**
 * The pilot's state machine, rendered as the thing an operator actually asks:
 * "I scanned the box in — now what?" The answer for step 2 is "nothing, it's the
 * customer's move", which is exactly where people get stuck, so it's called out
 * rather than left as a gap between two staff screens.
 *
 * Codes and ordering come from docs/warehouse-api.md §2.
 */
function LifecycleStrip() {
  const { t, isRTL } = useTranslation();

  const steps: {
    key: string;
    code: string;
    icon: LucideIcon;
    title: string;
    description: string;
    href?: string;
    actor?: string;
  }[] = [
    {
      key: "receive",
      code: "E01",
      icon: ScanLine,
      title: t("warehouse.hub.flow.receive"),
      description: t("warehouse.hub.flow.receiveDesc"),
      href: "/warehouse/receiving",
    },
    {
      key: "confirm",
      code: "T01",
      icon: UserCheck,
      title: t("warehouse.hub.flow.confirm"),
      description: t("warehouse.hub.flow.confirmDesc"),
      actor: t("warehouse.hub.flow.customerStep"),
    },
    {
      key: "bin",
      code: "E02",
      icon: Boxes,
      title: t("warehouse.hub.flow.bin"),
      description: t("warehouse.hub.flow.binDesc"),
      href: "/warehouse/wall",
    },
    {
      key: "load",
      code: "E04",
      icon: Truck,
      title: t("warehouse.hub.flow.load"),
      description: t("warehouse.hub.flow.loadDesc"),
      href: "/warehouse/loading",
    },
    {
      key: "deliver",
      code: "E05",
      icon: PackageCheck,
      title: t("warehouse.hub.flow.deliver"),
      description: t("warehouse.hub.flow.deliverDesc"),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("warehouse.hub.flow.title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("warehouse.hub.flow.subtitle")}</p>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-5">
          {steps.map((step, i) => {
            const body = (
              <div
                className={cn(
                  "flex h-full flex-col rounded-lg border p-3",
                  step.href ? "transition-colors hover:bg-accent" : "border-dashed bg-muted/30",
                )}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[11px] font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <step.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Badge variant="outline" className="ms-auto font-mono text-[10px]">
                    {step.code}
                  </Badge>
                </div>
                <div className="text-sm font-medium text-foreground">{step.title}</div>
                <p className="mt-1 text-xs leading-snug text-muted-foreground">
                  {step.description}
                </p>
                {step.actor && (
                  <Badge variant="secondary" className="mt-2 w-fit text-[10px]">
                    {step.actor}
                  </Badge>
                )}
              </div>
            );

            return (
              <li key={step.key} className="h-full">
                {step.href ? (
                  <Link href={step.href} className="block h-full">
                    {body}
                  </Link>
                ) : (
                  body
                )}
              </li>
            );
          })}
        </ol>

        {/* The unhappy path. E06 doesn't return the box to the warehouse on its
            own — E07 at the return desk is what resets the epoch and makes a
            second delivery attempt possible. */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 p-3 text-xs text-muted-foreground">
          <Badge variant="destructive" className="font-mono text-[10px]">
            E06
          </Badge>
          <span className="font-medium text-foreground">{t("warehouse.hub.flow.failed")}</span>
          <ArrowRight className={cn("h-3 w-3 shrink-0", isRTL && "rotate-180")} />
          <Badge variant="outline" className="font-mono text-[10px]">
            E07
          </Badge>
          <Link
            href="/warehouse/return"
            className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {t("warehouse.hub.flow.return")}
          </Link>
          <span>— {t("warehouse.hub.flow.returnDesc")}</span>
          <ClipboardCheck className="ms-auto hidden h-4 w-4 sm:block" />
        </div>
      </CardContent>
    </Card>
  );
}
