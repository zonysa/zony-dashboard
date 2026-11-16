"use client";

import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useDeleteUser } from "@/lib/hooks/useUsers";

/** Confirm, then permanently delete a courier's account. `target` null = closed. */
export function DeleteCourierDialog({
  target,
  onClose,
}: {
  target: { id: string; name: string } | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const deleteUser = useDeleteUser({ redirect: false });

  async function handleDelete() {
    if (!target) return;
    try {
      await deleteUser.mutateAsync(target.id);
      toast.success(t("couriers.delete.success"));
      onClose();
    } catch (err) {
      toast.error(
        (err instanceof Error && err.message) || t("couriers.delete.error"),
      );
    }
  }

  return (
    <AlertDialog open={!!target} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("couriers.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("couriers.delete.description", { name: target?.name ?? "" })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteUser.isPending}>
            {t("common.cancel")}
          </AlertDialogCancel>
          {/* A plain Button, not AlertDialogAction: that one closes the
              dialog on click, before the delete has succeeded or failed. */}
          <Button
            variant="destructive"
            disabled={deleteUser.isPending}
            onClick={handleDelete}
          >
            {deleteUser.isPending
              ? t("couriers.delete.deleting")
              : t("common.delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
