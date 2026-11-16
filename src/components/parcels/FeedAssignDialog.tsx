"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssignDialog } from "@/components/warehouse/WarehouseDialogs";
import { useResolvedWarehouseId } from "@/components/warehouse/WarehouseSelect";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetCouriers, useGetParcel } from "@/lib/hooks/useWarehouse";
import { ParcelFeedRow } from "@/lib/schema/parcel.schema";

/**
 * E03 courier assignment, opened from a warehouse row of the Parcels feed.
 *
 * The feed row isn't enough for the shared AssignDialog: its `courier_id` can
 * be the checkout courier rather than the E03 one, and the dialog's form
 * seeds its default (and decides whether to offer "Remove assignment") once,
 * on mount. So the warehouse parcel is read first and the dialog mounts only
 * when its `assigned_courier_id` is known.
 *
 * Couriers come from the selected warehouse, as on the warehouse parcel
 * screen — a parcel record doesn't name its building.
 */
export function FeedAssignDialog({
  row,
  onClose,
}: {
  row: ParcelFeedRow;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { data, isError } = useGetParcel(row.id);
  const { warehouseId } = useResolvedWarehouseId();
  const { data: couriersData } = useGetCouriers(warehouseId);

  const parcel = data?.parcel;

  if (!parcel) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("warehouseLoading.assignDialog.title")}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {isError ? t("warehouseParcel.notFound") : t("common.loading")}
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <AssignDialog
      target={{
        parcelId: parcel.id,
        barcode: parcel.barcode,
        recipientName: parcel.recipient_name,
        assignedCourierId: parcel.assigned_courier_id,
      }}
      couriers={couriersData?.couriers ?? []}
      onClose={onClose}
    />
  );
}
