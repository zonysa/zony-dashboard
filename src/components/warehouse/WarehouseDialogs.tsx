"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  mintClientEventId,
  useAssignParcel,
  useCheckoutParcel,
  useMarkReturnedToOrigin,
  useSendToRto,
  useUnassignParcel,
} from "@/lib/hooks/useWarehouse";
import {
  assignParcelSchema,
  AssignParcelData,
  checkoutParcelSchema,
  CheckoutParcelData,
  SendToRtoData,
  WHCourier,
} from "@/lib/schema/warehouse.schema";

export function courierLabel(c: WHCourier): string {
  const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  return name || c.username;
}

export type CheckoutTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
  assignedCourierId: string | null;
};

export type AssignTarget = {
  parcelId: string;
  barcode: string;
  recipientName: string;
  assignedCourierId: string | null;
};

// Checkout (E04) no longer picks a courier: the server takes it from the E03
// assignment and 409s on a mismatch. So this just confirms, showing which
// courier the box goes out with.
export function CheckoutDialog({
  target,
  courierName,
  onClose,
}: {
  target: CheckoutTarget;
  courierName?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const checkoutParcel = useCheckoutParcel();
  // Minted once, when this dialog opens for this parcel — reused across any
  // retry of the same checkout attempt, per the client_event_id contract.
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<CheckoutParcelData>({
    resolver: zodResolver(checkoutParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: CheckoutParcelData) {
    try {
      // No courier_id — the assignment owns it.
      await checkoutParcel.mutateAsync({
        id: target.parcelId,
        data: { client_event_id: data.client_event_id, notes: data.notes },
      });
      onClose();
    } catch (err) {
      console.error("Checkout failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("warehouseLoading.checkoutDialog.title")}
          </DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="text-muted-foreground">
            {t("warehouseLoading.checkoutDialog.assignedCourier")}:{" "}
          </span>
          <span className="font-medium">
            {courierName ?? t("warehouseLoading.unassigned")}
          </span>
        </div>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.checkoutDialog.notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("warehouseLoading.actions.cancel")}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("warehouseLoading.checkoutDialog.submitting")
                  : t("warehouseLoading.checkoutDialog.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// E03 — assign or reassign a single parcel to a courier, or remove the
// assignment. The couriers come from /warehouse/couriers (active, with a
// per-warehouse assigned count) rather than the legacy /users role filter.
export function AssignDialog({
  target,
  couriers,
  onClose,
}: {
  target: AssignTarget;
  couriers: WHCourier[];
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assign = useAssignParcel();
  const unassign = useUnassignParcel();
  const [clientEventId] = useState(() => mintClientEventId());

  const form = useForm<AssignParcelData>({
    resolver: zodResolver(assignParcelSchema),
    defaultValues: {
      client_event_id: clientEventId,
      courier_id: target.assignedCourierId ?? "",
      notes: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  async function onSubmit(data: AssignParcelData) {
    try {
      await assign.mutateAsync({ id: target.parcelId, data });
      onClose();
    } catch (err) {
      console.error("Assign failed:", err);
    }
  }

  async function onUnassign() {
    try {
      await unassign.mutateAsync({
        id: target.parcelId,
        data: { client_event_id: clientEventId },
      });
      onClose();
    } catch (err) {
      console.error("Unassign failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseLoading.assignDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={control}
              name="courier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.assignDialog.courier")}
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={t(
                            "warehouseLoading.assignDialog.courierPlaceholder",
                          )}
                        />
                      </SelectTrigger>
                    </FormControl>
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("warehouseLoading.assignDialog.notes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:justify-between">
              {target.assignedCourierId ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive"
                  disabled={unassign.isPending}
                  onClick={onUnassign}
                >
                  {unassign.isPending
                    ? t("warehouseLoading.assignDialog.unassigning")
                    : t("warehouseLoading.assignDialog.unassignSubmit")}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  {t("warehouseLoading.actions.cancel")}
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? t("warehouseLoading.assignDialog.submitting")
                    : t("warehouseLoading.assignDialog.submit")}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// R02 — terminal. Confirms the box is back with the merchant; the id is
// minted once when the dialog opens so a retry replays instead of doubling.
export function ReturnedDialog({
  target,
  onClose,
}: {
  target: AssignTarget;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const markReturned = useMarkReturnedToOrigin();
  const [clientEventId] = useState(() => mintClientEventId());
  const [notes, setNotes] = useState("");

  async function onSubmit() {
    try {
      await markReturned.mutateAsync({
        id: target.parcelId,
        data: {
          client_event_id: clientEventId,
          notes: notes.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error("Mark returned failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseQueue.returnedDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {t("warehouseQueue.returnedDialog.body")}
        </p>
        <Textarea
          rows={2}
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("warehouseQueue.returnedDialog.notes")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("warehouseLoading.actions.cancel")}
          </Button>
          <Button disabled={markReturned.isPending} onClick={onSubmit}>
            {markReturned.isPending
              ? t("warehouseQueue.returnedDialog.submitting")
              : t("warehouseQueue.returnedDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const RTO_REASONS: SendToRtoData["return_type"][] = [
  "customer_return",
  "merchant_recall",
  "max_attempts",
  "window_expired",
  "pudo_return",
];

// R01 — staff send a parcel back to its merchant with an explicit reason.
export function SendToRtoDialog({
  target,
  onClose,
}: {
  target: AssignTarget;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const sendToRto = useSendToRto();
  const [clientEventId] = useState(() => mintClientEventId());
  const [returnType, setReturnType] = useState<
    SendToRtoData["return_type"] | ""
  >("");
  const [notes, setNotes] = useState("");

  async function onSubmit() {
    if (!returnType) return;
    try {
      await sendToRto.mutateAsync({
        id: target.parcelId,
        data: {
          client_event_id: clientEventId,
          return_type: returnType,
          notes: notes.trim() || undefined,
        },
      });
      onClose();
    } catch (err) {
      console.error("Send to RTO failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("warehouseQueue.rtoDialog.title")}</DialogTitle>
          <DialogDescription>
            {target.recipientName} ·{" "}
            <span className="font-mono">{target.barcode}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("warehouseQueue.rtoDialog.reason")}
          </label>
          <Select
            value={returnType || undefined}
            onValueChange={(v) =>
              setReturnType(v as SendToRtoData["return_type"])
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={t("warehouseQueue.rtoDialog.reasonPlaceholder")}
              />
            </SelectTrigger>
            <SelectContent>
              {RTO_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`warehouseQueue.returnTypes.${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Textarea
          rows={2}
          value={notes}
          maxLength={500}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={t("warehouseQueue.returnedDialog.notes")}
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("warehouseLoading.actions.cancel")}
          </Button>
          <Button
            disabled={!returnType || sendToRto.isPending}
            onClick={onSubmit}
          >
            {sendToRto.isPending
              ? t("warehouseQueue.rtoDialog.submitting")
              : t("warehouseQueue.rtoDialog.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
