"use client";

import { useState } from "react";
import { PackageCheck } from "lucide-react";

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
import { useGetBranches } from "@/lib/hooks/useBranch";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useAcceptHandover,
  useGetPendingHandovers,
} from "@/lib/hooks/useWarehouse";
import { useUserRole } from "@/lib/stores/auth-store";
import { WHPendingHandover } from "@/lib/schema/warehouse.schema";

// Only a global role has anything to filter — a `responsible`'s own shop is
// already the entire list the backend hands back, and a filter control that
// did nothing (or worse, that the client had to fake-scope itself) would be
// worse than not offering one.
const GLOBAL_ROLES = new Set(["admin", "supervisor"]);

/**
 * A shop's own inbox: boxes a courier says they dropped off, awaiting the
 * shop's signature. For `responsible` this is the one warehouse-adjacent
 * screen they may open at all — see CLAUDE.md's "warehouse -> PUDO" section
 * and the RESPONSIBLE_ROLE comment in app/core/policies/warehouse.py. Nothing
 * rendered here is warehouse-floor data: every row is scoped server-side to
 * a box already handed to a specific shop.
 */
export default function PudoHandoversPage() {
  const { t } = useTranslation();
  const { role } = useUserRole();
  const canFilterByPudo = !!role && GLOBAL_ROLES.has(role);

  const [pudoFilter, setPudoFilter] = useState<string>("");
  const pudoId = pudoFilter ? Number(pudoFilter) : undefined;

  const { data, isLoading, isError } = useGetPendingHandovers(pudoId);
  // Only fetched for the filter control, and only when it can matter.
  const { data: branchesRes } = useGetBranches(
    { limit: 200 },
    canFilterByPudo,
  );

  const [acceptTarget, setAcceptTarget] = useState<WHPendingHandover | null>(
    null,
  );

  return (
    <PageContainer size="lg" className="px-6 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {t("warehousePudoHandovers.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("warehousePudoHandovers.subtitle")}
          </p>
        </div>
        {canFilterByPudo && (
          <Select
            value={pudoFilter}
            onValueChange={(value) =>
              setPudoFilter(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="w-56">
              <SelectValue
                placeholder={t("warehousePudoHandovers.pudoFilterPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("warehousePudoHandovers.allPudos")}
              </SelectItem>
              {(branchesRes?.pudos ?? []).map((branch) => (
                <SelectItem key={branch.id} value={String(branch.id)}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {isError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive">
          {t("warehousePudoHandovers.loadError")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {t("warehousePudoHandovers.pending.title", {
              count: data?.count ?? 0,
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : !data?.handovers?.length ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <PackageCheck className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                {t("warehousePudoHandovers.pending.empty")}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.barcode")}</TableHead>
                  <TableHead>{t("warehousePudoHandovers.table.recipient")}</TableHead>
                  <TableHead>{t("warehousePudoHandovers.table.phone")}</TableHead>
                  {canFilterByPudo && (
                    <TableHead>{t("warehousePudoHandovers.table.pudo")}</TableHead>
                  )}
                  <TableHead>{t("warehousePudoHandovers.table.handedOverAt")}</TableHead>
                  <TableHead className="text-end">
                    {t("warehousePudoHandovers.table.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.handovers.map((entry) => (
                  <TableRow key={entry.parcel_id}>
                    <TableCell className="font-mono">{entry.barcode}</TableCell>
                    <TableCell>{entry.recipient_name}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {entry.recipient_phone}
                    </TableCell>
                    {canFilterByPudo && (
                      <TableCell>
                        {entry.pudo_name ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground">
                      {entry.handed_over_at ?? "—"}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setAcceptTarget(entry)}
                      >
                        {t("warehousePudoHandovers.actions.accept")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {acceptTarget && (
        <AcceptDialog
          target={acceptTarget}
          onClose={() => setAcceptTarget(null)}
        />
      )}
    </PageContainer>
  );
}

function AcceptDialog({
  target,
  onClose,
}: {
  target: WHPendingHandover;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const acceptHandover = useAcceptHandover();
  const [clientEventId] = useState(() => mintClientEventId());
  const [acceptedTracking, setAcceptedTracking] = useState<string | null>(
    null,
  );

  async function handleConfirm() {
    try {
      const result = await acceptHandover.mutateAsync({
        id: target.parcel_id,
        data: { client_event_id: clientEventId },
      });
      // Not a toast: the tracking number is the one thing worth putting in
      // front of the person who just accepted this, and a toast disappears
      // before they can note it down.
      if (result.parcel?.tracking_number) {
        setAcceptedTracking(result.parcel.tracking_number);
      } else {
        onClose();
      }
    } catch (err) {
      // useAcceptHandover's onError already toasts the server message.
      console.error("Accept handover failed:", err);
    }
  }

  if (acceptedTracking) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("warehousePudoHandovers.acceptDialog.doneTitle")}</DialogTitle>
            <DialogDescription>
              {t("warehousePudoHandovers.acceptDialog.doneExplanation")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center gap-2 rounded-lg border bg-muted/30 py-4">
            <Badge variant="success" className="px-3 py-1 font-mono text-sm">
              {acceptedTracking}
            </Badge>
          </div>
          <DialogFooter>
            <Button type="button" onClick={onClose}>
              {t("warehousePudoHandovers.actions.close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehousePudoHandovers.acceptDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipient_name} · <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          {t("warehousePudoHandovers.acceptDialog.explanation")}
        </p>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            {t("warehousePudoHandovers.actions.cancel")}
          </Button>
          <Button
            type="button"
            disabled={acceptHandover.isPending}
            onClick={handleConfirm}
          >
            {acceptHandover.isPending
              ? t("warehousePudoHandovers.acceptDialog.submitting")
              : t("warehousePudoHandovers.acceptDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
