"use client";

import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { WHBatchState } from "@/lib/schema/warehouse.schema";

const VARIANT: Record<
  WHBatchState,
  "default" | "secondary" | "success" | "outline"
> = {
  open: "default",
  sealed: "outline",
  handed_over: "success",
};

export function BatchStateBadge({ state }: { state: WHBatchState }) {
  const { t } = useTranslation();
  return (
    <Badge variant={VARIANT[state]}>
      {t(`warehouseBatches.state.${state}`)}
    </Badge>
  );
}
