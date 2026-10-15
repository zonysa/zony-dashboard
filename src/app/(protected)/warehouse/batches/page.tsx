"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
import { Can } from "@/components/auth/Can";
import { BatchStateBadge } from "@/components/warehouse/BatchStateBadge";
import {
  useResolvedWarehouseId,
  WarehouseSelect,
} from "@/components/warehouse/WarehouseSelect";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useCreateBatch,
  useGetBatches,
  useGetCarriers,
} from "@/lib/hooks/useWarehouse";
import { Permission } from "@/lib/rbac/permissions";
import { WHBatchState } from "@/lib/schema/warehouse.schema";

const ALL = "all";

export default function BatchesPage() {
  const { t } = useTranslation();
  const { warehouseId } = useResolvedWarehouseId();
  const { data: carriersData } = useGetCarriers();
  const [carrierFilter, setCarrierFilter] = useState(ALL);
  const [stateFilter, setStateFilter] = useState(ALL);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError } = useGetBatches(warehouseId, {
    carrier_id: carrierFilter === ALL ? undefined : Number(carrierFilter),
    state: stateFilter === ALL ? undefined : (stateFilter as WHBatchState),
  });

  const carriers = useMemo(
    () => carriersData?.carriers ?? [],
    [carriersData?.carriers],
  );
  const carrierName = (id: number) =>
    carriers.find((c) => c.id === id)?.name ?? `#${id}`;
  const batches = data?.batches ?? [];

  return (
    <PageContainer size="xl" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehouseBatches.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehouseBatches.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <WarehouseSelect />
          <Select value={carrierFilter} onValueChange={setCarrierFilter}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                {t("warehouseBatches.allCarriers")}
              </SelectItem>
              {carriers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                {t("warehouseBatches.allStates")}
              </SelectItem>
              {(["open", "sealed", "handed_over"] as const).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`warehouseBatches.state.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Can do={Permission.MANAGE_WAREHOUSE}>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              {t("warehouseBatches.actions.create")}
            </Button>
          </Can>
        </div>
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehouseBatches.loadError")}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : !batches.length ? (
            <p className="text-sm text-muted-foreground">
              {t("warehouseBatches.empty")}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("warehouseBatches.table.batch")}</TableHead>
                  <TableHead>{t("warehouseBatches.table.carrier")}</TableHead>
                  <TableHead>{t("warehouseBatches.table.state")}</TableHead>
                  <TableHead>{t("warehouseBatches.table.created")}</TableHead>
                  <TableHead>
                    {t("warehouseBatches.table.handedOverTo")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono">
                      <Link
                        href={`/warehouse/batches/${b.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {b.code || `#${b.id}`}
                      </Link>
                    </TableCell>
                    <TableCell>{carrierName(b.carrier_id)}</TableCell>
                    <TableCell>
                      <BatchStateBadge state={b.state} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {b.created_at}
                    </TableCell>
                    <TableCell>{b.handed_over_to ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {createOpen && warehouseId && (
        <CreateBatchDialog
          warehouseId={warehouseId}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </PageContainer>
  );
}

function CreateBatchDialog({
  warehouseId,
  onClose,
}: {
  warehouseId: number;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();
  const create = useCreateBatch();
  const { data: carriersData } = useGetCarriers();
  const carriers = (carriersData?.carriers ?? []).filter((c) => c.is_active);
  const [carrierId, setCarrierId] = useState("");
  const [code, setCode] = useState("");

  async function onSubmit() {
    if (!carrierId) return;
    try {
      const res = await create.mutateAsync({
        warehouseId,
        data: { carrier_id: Number(carrierId), code: code.trim() || undefined },
      });
      onClose();
      router.push(`/warehouse/batches/${res.batch.id}`);
    } catch (err) {
      console.error("Create batch failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseBatches.createDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("warehouseBatches.createDialog.subtitle")}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Select value={carrierId || undefined} onValueChange={setCarrierId}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t(
                  "warehouseBatches.createDialog.carrierPlaceholder",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {carriers.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code} · {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            value={code}
            maxLength={30}
            onChange={(e) => setCode(e.target.value)}
            placeholder={t("warehouseBatches.createDialog.codePlaceholder")}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("warehouseLoading.actions.cancel")}
          </Button>
          <Button disabled={!carrierId || create.isPending} onClick={onSubmit}>
            {create.isPending
              ? t("warehouseBatches.createDialog.creating")
              : t("warehouseBatches.createDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
