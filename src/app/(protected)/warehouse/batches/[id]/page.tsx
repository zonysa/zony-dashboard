"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { Can } from "@/components/auth/Can";
import { PageContainer } from "@/components/PageContainer";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchStateBadge } from "@/components/warehouse/BatchStateBadge";
import { useResolvedWarehouseId } from "@/components/warehouse/WarehouseSelect";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useGetBatch,
  useGetCarriers,
  useGetMerchants,
  useHandoverBatch,
  useResolveBarcode,
  useSetParcelBatch,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import {
  canEmit,
  HandoverBatchRes,
  WHParcel,
} from "@/lib/schema/warehouse.schema";

export default function BatchDetailPage() {
  const { t } = useTranslation();
  const params = useParams();
  const batchId = Number(params.id);
  const { data, isLoading, isError } = useGetBatch(
    Number.isFinite(batchId) ? batchId : null,
  );
  const { data: carriersData } = useGetCarriers();
  const { data: merchantsData } = useGetMerchants();
  const [handoverOpen, setHandoverOpen] = useState(false);

  const batch = data?.batch;
  const parcels = data?.parcels ?? [];
  const carrier = carriersData?.carriers.find(
    (c) => c.id === batch?.carrier_id,
  );
  const merchantName = (id: number | null) =>
    id == null
      ? "—"
      : (merchantsData?.merchants.find((m) => m.id === id)?.name ?? `#${id}`);
  const editable = !!batch && batch.state !== "handed_over";

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <Link
        href="/warehouse/batches"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
        {t("warehouseBatches.back")}
      </Link>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseBatches.detail.loadError")}
        </div>
      )}

      {isLoading || !batch ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="flex items-center gap-3 font-mono text-xl font-semibold text-foreground">
                {batch.code || `#${batch.id}`}
                <BatchStateBadge state={batch.state} />
              </h1>
              <p className="text-sm text-muted-foreground">
                {carrier
                  ? `${carrier.code} · ${carrier.name}`
                  : `#${batch.carrier_id}`}
                {batch.handed_over_to
                  ? ` — ${t("warehouseBatches.detail.handedTo", { name: batch.handed_over_to })}`
                  : ""}
              </p>
            </div>
            <Can do={Permission.MANAGE_WAREHOUSE}>
              {editable && (
                <Button onClick={() => setHandoverOpen(true)}>
                  {t("warehouseBatches.detail.handover")}
                </Button>
              )}
            </Can>
          </div>

          {editable && (
            <Can do={Permission.MANAGE_WAREHOUSE}>
              <ScanToAdd batchId={batch.id} />
            </Can>
          )}

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("warehouseBatches.detail.parcels")}</CardTitle>
              <span className="text-sm text-muted-foreground">
                {parcels.length}
              </span>
            </CardHeader>
            <CardContent>
              {!parcels.length ? (
                <p className="text-sm text-muted-foreground">
                  {t("warehouseBatches.detail.empty")}
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("warehouseBatches.detail.barcode")}
                      </TableHead>
                      <TableHead>
                        {t("warehouseBatches.detail.merchant")}
                      </TableHead>
                      <TableHead>
                        {t("warehouseBatches.detail.status")}
                      </TableHead>
                      <TableHead className="text-end">
                        {t("warehouseBatches.detail.actions")}
                      </TableHead>
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
                        <TableCell>{merchantName(p.merchant_id)}</TableCell>
                        <TableCell>
                          <WarehouseStatusBadge status={p.status} />
                        </TableCell>
                        <TableCell className="text-end">
                          <Can do={Permission.MANAGE_WAREHOUSE}>
                            {editable && canEmit(p.status, "D01") && (
                              <RemoveButton parcel={p} />
                            )}
                          </Can>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {batch && handoverOpen && (
        <HandoverDialog
          batchId={batch.id}
          count={parcels.length}
          onClose={() => setHandoverOpen(false)}
        />
      )}
    </PageContainer>
  );
}

// Barcode → resolve → D01 with this batch. The event id is minted once per
// scan and rotated only on success, so a retried request replays.
function ScanToAdd({ batchId }: { batchId: number }) {
  const { t } = useTranslation();
  const { warehouseId } = useResolvedWarehouseId();
  const resolve = useResolveBarcode();
  const setBatch = useSetParcelBatch();
  const [barcode, setBarcode] = useState("");
  const [clientEventId, setClientEventId] = useState(() => mintClientEventId());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const busy = resolve.isPending || setBatch.isPending;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = barcode.trim();
    if (!code || !warehouseId || busy) return;
    try {
      const { parcel } = await resolve.mutateAsync({
        barcode: code,
        warehouseId,
      });
      await setBatch.mutateAsync({
        id: parcel.id,
        data: { client_event_id: clientEventId, batch_id: batchId },
      });
      setBarcode("");
      setClientEventId(mintClientEventId());
      inputRef.current?.focus();
    } catch (err) {
      // Both hooks toast the server message; keep the barcode for a retry.
      console.error("Add to batch failed:", err);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            dir="ltr"
            value={barcode}
            maxLength={64}
            autoComplete="off"
            className="font-mono"
            onChange={(e) => setBarcode(e.target.value)}
            placeholder={t("warehouseBatches.detail.scanPlaceholder")}
          />
          <Button type="submit" disabled={!barcode.trim() || busy}>
            {t("warehouseBatches.detail.add")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RemoveButton({ parcel }: { parcel: WHParcel }) {
  const { t } = useTranslation();
  const setBatch = useSetParcelBatch();
  const [clientEventId] = useState(() => mintClientEventId());
  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-destructive"
      disabled={setBatch.isPending}
      onClick={() =>
        setBatch.mutate({
          id: parcel.id,
          data: { client_event_id: clientEventId, batch_id: null },
        })
      }
    >
      {t("warehouseBatches.detail.remove")}
    </Button>
  );
}

// D02 for the whole batch. The server seals the batch even if some parcels
// fail, so after it returns we stay open and list every failure.
function HandoverDialog({
  batchId,
  count,
  onClose,
}: {
  batchId: number;
  count: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const handover = useHandoverBatch();
  const [to, setTo] = useState("");
  const [result, setResult] = useState<HandoverBatchRes | null>(null);

  async function onSubmit() {
    try {
      const res = await handover.mutateAsync({
        id: batchId,
        data: { handed_over_to: to.trim() || undefined },
      });
      if (res.failed_count === 0) onClose();
      else setResult(res);
    } catch (err) {
      console.error("Handover failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("warehouseBatches.handoverDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {result
              ? t("warehouseBatches.handoverDialog.resultSubtitle")
              : t("warehouseBatches.handoverDialog.body", { count })}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-3 text-sm">
            <p>
              {t("warehouseBatches.handoverDialog.summary", {
                ok: result.handed_over_count,
                failed: result.failed_count,
              })}
            </p>
            <ul className="max-h-48 space-y-1 overflow-y-auto rounded-md border p-2">
              {result.failed.map((f) => (
                <li key={f.parcel_id}>
                  <Link
                    href={`/warehouse/parcels/${f.parcel_id}`}
                    className="font-mono underline-offset-2 hover:underline"
                  >
                    {f.parcel_id.slice(0, 8)}
                  </Link>{" "}
                  <span className="text-destructive">{f.error}</span>
                </li>
              ))}
            </ul>
            <DialogFooter>
              <Button onClick={onClose}>
                {t("warehouseBatches.handoverDialog.close")}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <>
            <Input
              value={to}
              maxLength={120}
              onChange={(e) => setTo(e.target.value)}
              placeholder={t("warehouseBatches.handoverDialog.toPlaceholder")}
            />
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {t("warehouseLoading.actions.cancel")}
              </Button>
              <Button disabled={handover.isPending} onClick={onSubmit}>
                {handover.isPending
                  ? t("warehouseBatches.handoverDialog.submitting")
                  : t("warehouseBatches.handoverDialog.submit")}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
