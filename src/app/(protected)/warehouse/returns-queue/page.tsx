"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AssignDialog,
  AssignTarget,
  CheckoutDialog,
  CheckoutTarget,
  courierLabel,
  ReturnedDialog,
} from "@/components/warehouse/WarehouseDialogs";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useGetCouriers,
  useGetSlots,
  useListParcels,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  canEmit,
  SendToRtoData,
  WHParcel,
  WHUccBucket,
} from "@/lib/schema/warehouse.schema";

type Tab = "retry" | "rto";

const BUCKET: Record<Tab, WHUccBucket> = {
  retry: "retry_delivery",
  rto: "rto",
};

const PER_PAGE = 50;

function addressLine(p: WHParcel["return_address"]): string {
  if (!p) return "—";
  return [p.line1, p.district, p.city].filter(Boolean).join(", ") || "—";
}

export default function ReturnsQueuePage() {
  return (
    <Suspense fallback={<ReturnsQueueSkeleton />}>
      <ReturnsQueueContent />
    </Suspense>
  );
}

function ReturnsQueueSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function ReturnsQueueContent() {
  const { t, isRTL } = useTranslation();
  const { warehouseId } = useResolvedWarehouseId();
  // ?tab=rto opens straight onto the RTO queue (the hub's RTO card links here).
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "rto" ? "rto" : "retry",
  );
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useListParcels(warehouseId, {
    bucket: BUCKET[tab],
    page,
    per_page: PER_PAGE,
  });
  const { data: couriersData } = useGetCouriers(warehouseId);
  const { data: slotsData } = useGetSlots();

  const couriers = useMemo(
    () => couriersData?.couriers ?? [],
    [couriersData?.couriers],
  );
  const courierNameById = useMemo(
    () => new Map(couriers.map((c) => [c.user_id, courierLabel(c)])),
    [couriers],
  );
  const slotLabelById = useMemo(
    () =>
      new Map(
        (slotsData?.slots ?? []).map((s) => [
          s.id,
          isRTL ? s.label_ar : s.label_en,
        ]),
      ),
    [slotsData?.slots, isRTL],
  );

  const [assignTarget, setAssignTarget] = useState<AssignTarget | null>(null);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(
    null,
  );
  const [returnTarget, setReturnTarget] = useState<WHParcel | null>(null);

  const parcels = data?.parcels ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  function targetOf(p: WHParcel) {
    return {
      parcelId: p.id,
      barcode: p.barcode,
      recipientName: p.recipient_name,
      assignedCourierId: p.assigned_courier_id,
    };
  }

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseQueue.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseQueue.subtitle")}
          </p>
        </div>
        <WarehouseSelect />
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => {
          setTab(v as Tab);
          setPage(1);
        }}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="retry">
            {t("warehouseQueue.tabs.retry")}
          </TabsTrigger>
          <TabsTrigger value="rto">{t("warehouseQueue.tabs.rto")}</TabsTrigger>
        </TabsList>
      </Tabs>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseQueue.loadError")}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>{t(`warehouseQueue.${tab}.title`)}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`warehouseQueue.${tab}.hint`)}
            </p>
          </div>
          <Badge variant="secondary">{total}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !parcels.length ? (
            <p className="text-sm text-muted-foreground">
              {t(`warehouseQueue.${tab}.empty`)}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseQueue.table.barcode")}</TableHead>
                  <TableHead>{t("warehouseQueue.table.recipient")}</TableHead>
                  <TableHead>{t("warehouseQueue.table.status")}</TableHead>
                  {tab === "retry" ? (
                    <>
                      <TableHead>
                        {t("warehouseQueue.table.attempts")}
                      </TableHead>
                      <TableHead>
                        {t("warehouseQueue.table.nextSlot")}
                      </TableHead>
                    </>
                  ) : (
                    <>
                      <TableHead>{t("warehouseQueue.table.reason")}</TableHead>
                      <TableHead>
                        {t("warehouseQueue.table.merchant")}
                      </TableHead>
                      <TableHead>
                        {t("warehouseQueue.table.returnAddress")}
                      </TableHead>
                    </>
                  )}
                  <TableHead>{t("warehouseQueue.table.courier")}</TableHead>
                  {tab === "rto" && (
                    <TableHead className="text-end">
                      {t("warehouseQueue.table.actions")}
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/warehouse/parcels/${p.id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {p.barcode}
                      </Link>
                    </TableCell>
                    <TableCell>{p.recipient_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <WarehouseStatusBadge status={p.status} />
                        {p.retry_hold && (
                          <Badge variant="outline">
                            {t("warehouseQueue.held")}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    {tab === "retry" ? (
                      <>
                        <TableCell>{p.failed_attempts}</TableCell>
                        <TableCell>
                          {p.confirmed_slot_id != null
                            ? (slotLabelById.get(p.confirmed_slot_id) ??
                              `#${p.confirmed_slot_id}`)
                            : t("warehouseQueue.noSlot")}
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>
                          {p.return_type
                            ? t(
                                `warehouseQueue.returnTypes.${p.return_type as SendToRtoData["return_type"]}`,
                              )
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {p.merchant_id != null ? `#${p.merchant_id}` : "—"}
                        </TableCell>
                        <TableCell className="max-w-56 truncate">
                          {addressLine(p.return_address)}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      {p.assigned_courier_id ? (
                        (courierNameById.get(p.assigned_courier_id) ??
                        p.assigned_courier_id)
                      ) : (
                        <span className="text-muted-foreground">
                          {t("warehouseQueue.unassigned")}
                        </span>
                      )}
                    </TableCell>
                    {tab === "rto" && (
                      <TableCell className="text-end">
                        <Can do={Permission.MANAGE_WAREHOUSE}>
                          <div className="flex items-center justify-end gap-2">
                            {canEmit(p.status, "E03") && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setAssignTarget(targetOf(p))}
                              >
                                {p.assigned_courier_id
                                  ? t("warehouseLoading.actions.reassign")
                                  : t("warehouseLoading.actions.assign")}
                              </Button>
                            )}
                            {canEmit(p.status, "E04") && (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={!p.assigned_courier_id}
                                title={
                                  !p.assigned_courier_id
                                    ? t("warehouseLoading.assignFirst")
                                    : undefined
                                }
                                onClick={() => setCheckoutTarget(targetOf(p))}
                              >
                                {t("warehouseLoading.actions.checkout")}
                              </Button>
                            )}
                            {canEmit(p.status, "R02") && (
                              <Button
                                size="sm"
                                onClick={() => setReturnTarget(p)}
                              >
                                {t("warehouseQueue.actions.returned")}
                              </Button>
                            )}
                          </div>
                        </Can>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {lastPage > 1 && (
            <div className="mt-4 flex items-center justify-end gap-3 text-sm">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((n) => n - 1)}
              >
                {t("warehouseQueue.prev")}
              </Button>
              <span className="text-muted-foreground">
                {page} / {lastPage}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= lastPage}
                onClick={() => setPage((n) => n + 1)}
              >
                {t("warehouseQueue.next")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {assignTarget && (
        <AssignDialog
          target={assignTarget}
          couriers={couriers}
          onClose={() => setAssignTarget(null)}
        />
      )}
      {checkoutTarget && (
        <CheckoutDialog
          target={checkoutTarget}
          courierName={
            checkoutTarget.assignedCourierId
              ? courierNameById.get(checkoutTarget.assignedCourierId)
              : undefined
          }
          onClose={() => setCheckoutTarget(null)}
        />
      )}
      {returnTarget && (
        <ReturnedDialog
          target={targetOf(returnTarget)}
          onClose={() => setReturnTarget(null)}
        />
      )}
    </PageContainer>
  );
}
