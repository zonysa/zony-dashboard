"use client";

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
import { useAssignParcelCourier } from "@/lib/hooks/useParcel";
import { getRoleId, useRoles } from "@/lib/hooks/useRoles";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useGetUsers } from "@/lib/hooks/useUsers";
import {
  AssignParcelCourierData,
  assignParcelCourierSchema,
} from "@/lib/schema/parcel.schema";

/**
 * Give a PUDO-flow parcel a courier — in practice, the courier who will go
 * and retrieve an expired parcel from its point (see courierAssignment.ts for
 * why `pending` parcels are excluded). Couriers are every active user with
 * the courier role; the role id is looked up, never hardcoded.
 */
export function AssignParcelCourierDialog({
  parcelId,
  barcode,
  currentCourierId,
  onClose,
}: {
  parcelId: string;
  barcode?: string | null;
  currentCourierId: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const assign = useAssignParcelCourier();

  const { data: roles } = useRoles();
  const courierRoleId = getRoleId(roles?.roles, "courier");
  const { data: couriersRes, isLoading: couriersLoading } = useGetUsers(
    { role_id: courierRoleId ?? 0, is_active: true, limit: 100 },
    courierRoleId !== undefined,
  );
  const couriers = couriersRes?.users ?? [];

  const form = useForm<AssignParcelCourierData>({
    resolver: zodResolver(assignParcelCourierSchema),
    defaultValues: { courier_id: currentCourierId ?? "" },
  });

  async function onSubmit(data: AssignParcelCourierData) {
    try {
      await assign.mutateAsync({ id: parcelId, data });
      onClose();
    } catch (err) {
      // The hook already toasts the error; stay open so they can retry.
      console.error("Assign courier failed:", err);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("parcelCourierAssign.title")}</DialogTitle>
          <DialogDescription>
            {t("parcelCourierAssign.description")}
            {barcode && (
              <>
                {" · "}
                <span className="font-mono">{barcode}</span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="courier_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("parcelCourierAssign.courier")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value || undefined}
                    disabled={couriersLoading}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue
                          placeholder={
                            couriersLoading
                              ? t("parcelCourierAssign.loadingCouriers")
                              : couriers.length === 0
                                ? t("parcelCourierAssign.noCouriers")
                                : t("parcelCourierAssign.courierPlaceholder")
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {couriers.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {[c.first_name, c.last_name]
                            .filter(Boolean)
                            .join(" ")
                            .trim() || c.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t("parcelCourierAssign.cancel")}
              </Button>
              <Button type="submit" disabled={assign.isPending}>
                {assign.isPending
                  ? t("parcelCourierAssign.submitting")
                  : t("parcelCourierAssign.submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
