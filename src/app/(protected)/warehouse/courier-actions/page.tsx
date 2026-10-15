"use client";

import { Suspense, useMemo, useState } from "react";
import { Info } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckoutDialog,
  courierLabel,
  DeliverDialog,
  FailDialog,
  HandoverDialog,
  ParcelTarget,
  ReturnedDialog,
} from "@/components/warehouse/WarehouseDialogs";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { usePudoNames } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetCouriers,
  useListParcels,
  useReturnParcel,
} from "@/lib/hooks/useWarehouse";
import { canEmit, WHParcel, WHParcelStatus } from "@/lib/schema/warehouse.schema";

// Admin stand-in for the courier app. Every action here goes through the
// STAFF /warehouse/* endpoints, never /courier/* (courier-role only, and it
// takes the courier from the JWT). The event log records the admin as the
// actor; checkout still takes the courier from the parcel's assignment.
//
// The courier's single "deliver" tap lets the server pick E05/E08/E07. The
// staff endpoints don't, so each row offers the specific action instead,
// mirroring the server's resolution (see resolve_delivery_code):
//   out_for_delivery, no planned PUDO -> E05 (or divert to a PUDO, E08)
//   out_for_delivery, planned PUDO    -> E08 only
//   attempt_failed / handed_to_pudo   -> E07
//   rto_out                           -> R02

// Statuses where the box is planned onto, or physically with, a courier.
// `assigned_courier_id` survives E04/E06/E08 and is only cleared when the box
// comes back (E07), so filtering on it plus these statuses is the courier's
// current plate at this warehouse.
const COURIER_STATUSES: WHParcelStatus[] = [
  "assigned",
  "rto_assigned",
  "out_for_delivery",
  "rto_out",
  "attempt_failed",
  "handed_to_pudo",
];

const PER_PAGE = 50;

type ActionDialog =
  | { kind: "checkout"; parcel: WHParcel }
  | { kind: "deliver"; parcel: WHParcel }
  | { kind: "handover"; parcel: WHParcel }
  | { kind: "fail"; parcel: WHParcel }
  | { kind: "returned"; parcel: WHParcel };

function targetOf(p: WHParcel): ParcelTarget {
  return {
    parcelId: p.id,
    barcode: p.barcode,
    recipientName: p.recipient_name,
  };
}

export default function CourierActionsPage() {
  return (
    <Suspense fallback={<CourierActionsSkeleton />}>
      <CourierActionsContent />
    </Suspense>
  );
}

function CourierActionsSkeleton() {
  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Skeleton className="mb-6 h-16 w-full" />
      <Skeleton className="h-96 w-full" />
    </PageContainer>
  );
}

function CourierActionsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { warehouseId } = useResolvedWarehouseId();
  const { data: couriersData, isLoading: couriersLoading } =
    useGetCouriers(warehouseId);
  const couriers = useMemo(
    () => couriersData?.couriers ?? [],
    [couriersData?.couriers],
  );

  // Kept in the URL so the selection survives a trip to a parcel's detail
  // page and back. A courier not on this warehouse's roster is ignored.
  const courierParam = searchParams.get("courier");
  const courier = couriers.find((c) => c.user_id === courierParam) ?? null;

  const [page, setPage] = useState(1);
  const { data, isLoading, isError } = useListParcels(
    courier ? warehouseId : null,
    {
      assigned_courier_id: courier?.user_id,
      status: COURIER_STATUSES,
      page,
      per_page: PER_PAGE,
    },
  );

  const {
    canList: canListPudos,
    branches,
    nameById: pudoNameById,
  } = usePudoNames();

  const [dialog, setDialog] = useState<ActionDialog | null>(null);

  const parcels = data?.parcels ?? [];
  const total = data?.total ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / PER_PAGE));

  function selectCourier(userId: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("courier", userId);
    router.replace(`${pathname}?${params.toString()}`);
    setPage(1);
  }

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseCourierActions.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseCourierActions.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <WarehouseSelect />
          <div className="w-64">
            <Select
              value={courier?.user_id}
              onValueChange={selectCourier}
              disabled={couriersLoading || !couriers.length}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t("warehouseCourierActions.courierPlaceholder")}
                />
              </SelectTrigger>
              <SelectContent>
                {couriers.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {courierLabel(c)} ·{" "}
                    <span className="text-muted-foreground">
                      {t("warehouseLoading.assignDialog.assignedCount", {
                        count: c.assigned_count,
                      })}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-500">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{t("warehouseCourierActions.onBehalfNotice")}</p>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseCourierActions.loadError")}
        </div>
      )}

      {!courier ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              {t("warehouseCourierActions.pickCourier")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>{courierLabel(courier)}</CardTitle>
            <Badge variant="secondary">{total}</Badge>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !parcels.length ? (
              <p className="text-sm text-muted-foreground">
                {t("warehouseCourierActions.empty")}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("warehouseCourierActions.table.barcode")}
                    </TableHead>
                    <TableHead>
                      {t("warehouseCourierActions.table.recipient")}
                    </TableHead>
                    <TableHead>
                      {t("warehouseCourierActions.table.destination")}
                    </TableHead>
                    <TableHead>
                      {t("warehouseCourierActions.table.status")}
                    </TableHead>
                    <TableHead>
                      {t("warehouseCourierActions.table.attempts")}
                    </TableHead>
                    <TableHead className="text-end">
                      {t("warehouseCourierActions.table.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parcels.map((p) => (
                    <CourierParcelRow
                      key={p.id}
                      parcel={p}
                      pudoNameById={pudoNameById}
                      onOpen={(kind) => setDialog({ kind, parcel: p })}
                    />
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
      )}

      {dialog?.kind === "checkout" && (
        <CheckoutDialog
          target={{
            ...targetOf(dialog.parcel),
            assignedCourierId: dialog.parcel.assigned_courier_id,
          }}
          courierName={courier ? courierLabel(courier) : undefined}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "deliver" && (
        <DeliverDialog
          target={targetOf(dialog.parcel)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "handover" && (
        <HandoverDialog
          parcelId={dialog.parcel.id}
          barcode={dialog.parcel.barcode}
          destinationPudoId={dialog.parcel.destination_pudo_id}
          branches={branches}
          canListPudos={canListPudos}
          pudoNameById={pudoNameById}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "fail" && (
        <FailDialog
          target={targetOf(dialog.parcel)}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.kind === "returned" && (
        <ReturnedDialog
          target={{
            ...targetOf(dialog.parcel),
            assignedCourierId: dialog.parcel.assigned_courier_id,
          }}
          onClose={() => setDialog(null)}
        />
      )}
    </PageContainer>
  );
}

function CourierParcelRow({
  parcel: p,
  pudoNameById,
  onOpen,
}: {
  parcel: WHParcel;
  pudoNameById: Map<number, string>;
  onOpen: (kind: ActionDialog["kind"]) => void;
}) {
  const { t } = useTranslation();
  const returnParcel = useReturnParcel();
  // Minted once per row and reused across clicks (the row leaves the list
  // once the E07 lands), per the client_event_id contract in useWarehouse.ts.
  const [returnEventId] = useState(() => mintClientEventId());

  const plannedPudo = p.destination_pudo_id;
  const isOut = p.status === "out_for_delivery";

  function handleReturn() {
    returnParcel.mutate(
      { id: p.id, data: { client_event_id: returnEventId } },
      {
        onSuccess: (res) => {
          if (res.parcel_status === "retry_scheduled")
            toast.success(t("warehouseReturn.outcome.retryScheduled"));
          else if (res.parcel_status === "rto_pending")
            toast.success(t("warehouseReturn.outcome.rtoPending"));
        },
      },
    );
  }

  return (
    <TableRow>
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
        {plannedPudo != null
          ? (pudoNameById.get(plannedPudo) ?? `PUDO #${plannedPudo}`)
          : t("warehouseCourierActions.home")}
      </TableCell>
      <TableCell>
        <WarehouseStatusBadge status={p.status} />
      </TableCell>
      <TableCell>{p.failed_attempts}</TableCell>
      <TableCell className="text-end">
        <div className="flex flex-wrap items-center justify-end gap-2">
          {canEmit(p.status, "E04") && (
            <Button size="sm" onClick={() => onOpen("checkout")}>
              {t("warehouseCourierActions.actions.checkout")}
            </Button>
          )}
          {isOut && plannedPudo == null && canEmit(p.status, "E05") && (
            <Button size="sm" onClick={() => onOpen("deliver")}>
              {t("warehouseCourierActions.actions.deliver")}
            </Button>
          )}
          {isOut && canEmit(p.status, "E08") && (
            <Button
              size="sm"
              variant={plannedPudo != null ? "default" : "outline"}
              onClick={() => onOpen("handover")}
            >
              {t("warehouseCourierActions.actions.handover")}
            </Button>
          )}
          {canEmit(p.status, "R02") && (
            <Button size="sm" onClick={() => onOpen("returned")}>
              {t("warehouseCourierActions.actions.returned")}
            </Button>
          )}
          {canEmit(p.status, "E06") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onOpen("fail")}
            >
              {t("warehouseCourierActions.actions.fail")}
            </Button>
          )}
          {canEmit(p.status, "E07") && (
            <Button
              size="sm"
              variant="outline"
              disabled={returnParcel.isPending}
              onClick={handleReturn}
            >
              {t("warehouseCourierActions.actions.returnToWarehouse")}
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
