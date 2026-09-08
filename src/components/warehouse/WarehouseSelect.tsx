"use client";

import { useEffect, useMemo } from "react";
import { Warehouse } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetWarehouses } from "@/lib/hooks/useWarehouse";
import {
  useSelectedWarehouseId,
  useSetSelectedWarehouseId,
} from "@/lib/stores/warehouse-store";

/**
 * Which building the screen is about.
 *
 * The list is already scoped server-side by role, which is what makes this
 * component the same code for everyone: `admin`/`supervisor` get every
 * warehouse and a real choice, while a `responsible` clerk is pinned to one
 * building by `wh_warehouse_staff` and gets a single-row list. So "only one
 * warehouse" and "pinned to this warehouse" are indistinguishable here, and
 * deliberately so — in both cases there is nothing to choose, and the control
 * renders as a plain label rather than a dropdown with one option.
 *
 * The selection is auto-resolved rather than left empty: every warehouse
 * screen is disabled until a building is known, so making the operator pick
 * before seeing anything would be a needless gate in the common case.
 */
export function useResolvedWarehouseId() {
  const selected = useSelectedWarehouseId();
  const setSelected = useSetSelectedWarehouseId();
  const { data, isLoading, isError } = useGetWarehouses();

  // Memoised: `?? []` mints a new array on every render, which would make the
  // effect below re-run continuously and re-write the store each time.
  const warehouses = useMemo(
    () => data?.warehouses ?? [],
    [data?.warehouses],
  );

  useEffect(() => {
    if (!warehouses.length) return;

    // A stored id the caller can no longer access — they were reassigned, or
    // the building was removed from their list — must not stick, or every
    // screen 403s with a stale localStorage value nobody can see.
    const stillValid =
      selected !== null && warehouses.some((w) => w.id === selected);

    if (!stillValid) {
      setSelected(warehouses[0].id);
    }
  }, [warehouses, selected, setSelected]);

  const resolved =
    selected !== null && warehouses.some((w) => w.id === selected)
      ? selected
      : null;

  return { warehouseId: resolved, warehouses, isLoading, isError };
}

export function WarehouseSelect({ className }: { className?: string }) {
  const { t } = useTranslation();
  const setSelected = useSetSelectedWarehouseId();
  const { warehouseId, warehouses, isLoading } = useResolvedWarehouseId();

  if (isLoading) {
    return <Skeleton className={className ?? "h-9 w-56"} />;
  }

  if (!warehouses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        {t("warehouseSelect.none")}
      </p>
    );
  }

  // Nothing to choose: a pinned clerk, or a single-warehouse deployment.
  if (warehouses.length === 1) {
    const only = warehouses[0];
    return (
      <div className="flex items-center gap-2 text-sm">
        <Warehouse className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">{only.name}</span>
        <span className="font-mono text-xs text-muted-foreground">
          {only.code}
        </span>
      </div>
    );
  }

  return (
    <Select
      value={warehouseId ? String(warehouseId) : undefined}
      onValueChange={(value) => setSelected(Number(value))}
    >
      <SelectTrigger className={className ?? "w-56"}>
        <Warehouse className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue placeholder={t("warehouseSelect.placeholder")} />
      </SelectTrigger>
      <SelectContent>
        {warehouses.map((w) => (
          <SelectItem key={w.id} value={String(w.id)}>
            {w.name}
            <span className="ms-2 font-mono text-xs text-muted-foreground">
              {w.code}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
