"use client";

import { useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import Link from "next/link";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetPudoReturns,
  useReturnReceived,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { WHPudoReturnEntry } from "@/lib/schema/warehouse.schema";

export default function PudoReturnsPage() {
  const { t } = useTranslation();
  const { warehouseId } = useResolvedWarehouseId();
  const { data, isLoading, isError } = useGetPudoReturns(warehouseId);
  const [target, setTarget] = useState<WHPudoReturnEntry | null>(null);

  const parcels = data?.parcels ?? [];

  function daysAt(entry: WHPudoReturnEntry) {
    if (!entry.at_pudo_at) return "—";
    return t("warehousePudoReturns.days", {
      count: Math.max(
        0,
        differenceInCalendarDays(new Date(), new Date(entry.at_pudo_at)),
      ),
    });
  }

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehousePudoReturns.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehousePudoReturns.subtitle")}
          </p>
        </div>
        <WarehouseSelect />
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehousePudoReturns.loadError")}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t("warehousePudoReturns.title")}</CardTitle>
          <Badge variant="secondary">{data?.count ?? 0}</Badge>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !parcels.length ? (
            <p className="text-sm text-muted-foreground">
              {t("warehousePudoReturns.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {t("warehousePudoReturns.table.barcode")}
                  </TableHead>
                  <TableHead>
                    {t("warehousePudoReturns.table.recipient")}
                  </TableHead>
                  <TableHead>{t("warehousePudoReturns.table.pudo")}</TableHead>
                  <TableHead>
                    {t("warehousePudoReturns.table.daysAt")}
                  </TableHead>
                  <TableHead className="text-end">
                    {t("warehousePudoReturns.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parcels.map((p) => (
                  <TableRow key={p.parcel_id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/warehouse/parcels/${p.parcel_id}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {p.barcode}
                      </Link>
                    </TableCell>
                    <TableCell>{p.recipient_name}</TableCell>
                    <TableCell>
                      {p.pudo_name ??
                        (p.pudo_id != null
                          ? `#${p.pudo_id}`
                          : t("warehousePudoReturns.unknownPudo"))}
                    </TableCell>
                    <TableCell>{daysAt(p)}</TableCell>
                    <TableCell className="text-end">
                      <Can do={Permission.MANAGE_WAREHOUSE}>
                        <Button size="sm" onClick={() => setTarget(p)}>
                          {t("warehousePudoReturns.actions.received")}
                        </Button>
                      </Can>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {target && (
        <ReceivedDialog entry={target} onClose={() => setTarget(null)} />
      )}
    </PageContainer>
  );
}

// R00. The id is minted once when the dialog opens for this box, so a retry
// replays instead of raising a second event.
function ReceivedDialog({
  entry,
  onClose,
}: {
  entry: WHPudoReturnEntry;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const receive = useReturnReceived();
  const [clientEventId] = useState(() => mintClientEventId());
  const [notes, setNotes] = useState("");

  async function onSubmit() {
    try {
      await receive.mutateAsync({
        id: entry.parcel_id,
        data: {
          client_event_id: clientEventId,
          notes: notes.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error("Return received failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehousePudoReturns.dialog.title")}</DialogTitle>
          <DialogDescription>
            {entry.recipient_name} ·{" "}
            <span className="font-mono">{entry.barcode}</span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("warehousePudoReturns.dialog.body")}
        </p>
        <Textarea
          rows={2}
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("warehousePudoReturns.dialog.notes")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("warehouseLoading.actions.cancel")}
          </Button>
          <Button disabled={receive.isPending} onClick={onSubmit}>
            {receive.isPending
              ? t("warehousePudoReturns.dialog.submitting")
              : t("warehousePudoReturns.dialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
