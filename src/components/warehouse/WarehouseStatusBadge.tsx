"use client";

import { Badge, badgeVariants } from "@/components/ui/badge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { cn } from "@/lib/utils";
import type { WHParcelStatus } from "@/lib/schema/warehouse.schema";

// One badge style per derived status, shared by every warehouse screen. Before
// this, each page kept its own copy of this map and they drifted; keep new
// statuses here only. Labels always come from `warehouseWall.status.<status>`
// so the wording (and its Arabic) lives in one place too.
type BadgeVariant = NonNullable<
  Parameters<typeof badgeVariants>[0]
>["variant"];

const STATUS_BADGE: Record<
  WHParcelStatus,
  { variant: BadgeVariant; className?: string }
> = {
  not_received: { variant: "outline" },
  awaiting_scheduling: { variant: "secondary" },
  scheduled: { variant: "default" },
  needs_rebin: {
    variant: "outline",
    className:
      "border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400",
  },
  ready_for_delivery: { variant: "success" },
  assigned: {
    variant: "outline",
    className:
      "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400",
  },
  retry_scheduled: {
    variant: "outline",
    className:
      "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  },
  out_for_delivery: { variant: "default" },
  attempt_failed: { variant: "destructive" },
  delivered: { variant: "success" },
  handed_to_pudo: {
    variant: "outline",
    className:
      "border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
  },
  at_pudo: { variant: "success" },
  // RTO leg — reds/oranges, distinct from a normal delivery.
  rto_pending: {
    variant: "outline",
    className:
      "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  },
  rto_assigned: {
    variant: "outline",
    className:
      "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  },
  rto_out: {
    variant: "outline",
    className:
      "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400",
  },
  returned_to_origin: { variant: "muted" },
  // 3PL dispatch flow — teals.
  ready_to_dispatch: {
    variant: "outline",
    className:
      "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  },
  batched: {
    variant: "outline",
    className:
      "border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400",
  },
  dispatched: { variant: "success" },
};

export function WarehouseStatusBadge({
  status,
  className,
}: {
  status: WHParcelStatus;
  className?: string;
}) {
  const { t } = useTranslation();
  const style = STATUS_BADGE[status] ?? { variant: "outline" as BadgeVariant };
  return (
    <Badge
      variant={style.variant}
      className={cn(style.className, className)}
    >
      {t(`warehouseWall.status.${status}`)}
    </Badge>
  );
}

export default WarehouseStatusBadge;
