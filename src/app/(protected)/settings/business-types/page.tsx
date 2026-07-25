"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DataTable } from "@/components/tables/data-table";
import { createBusinessTypesColumns } from "@/components/tables/columns/business-types-columns";
import { PageContainer } from "@/components/PageContainer";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useCreateBusinessType,
  useDeleteBusinessType,
  useGetBusinessTypes,
  useUpdateBusinessType,
} from "@/lib/hooks/useBusinessType";
import { BusinessTypeDetails, BusinessTypeSchema } from "@/lib/schema/businessType.schema";

function BusinessTypesSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useGetBusinessTypes();
  const createMutation = useCreateBusinessType();
  const updateMutation = useUpdateBusinessType();
  const deleteMutation = useDeleteBusinessType();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BusinessTypeDetails | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const businessTypes = data?.business_types || [];
  const isSaving = createMutation.isPending || updateMutation.isPending;

  const openCreateDialog = () => {
    setEditingItem(null);
    setFormName("");
    setFormDescription("");
    setFormError(null);
    setDialogOpen(true);
  };

  const openEditDialog = (businessType: BusinessTypeDetails) => {
    setEditingItem(businessType);
    setFormName(businessType.name);
    setFormDescription(businessType.description || "");
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const parsed = BusinessTypeSchema.safeParse({
      name: formName,
      description: formDescription || undefined,
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }
    setFormError(null);

    try {
      if (editingItem?.id) {
        await updateMutation.mutateAsync({
          id: editingItem.id,
          data: parsed.data,
        });
      } else {
        await createMutation.mutateAsync(parsed.data);
      }
      setDialogOpen(false);
    } catch {
      // errors are surfaced via toast in the mutation hooks
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <PageContainer size="lg">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/settings")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold">
                {t("settings.businessTypes.title", {
                  defaultValue: "Business Types",
                })}
              </h1>
              <p className="text-gray-500 text-sm">
                {t("settings.businessTypes.description", {
                  defaultValue: "Manage the list of business types available across the platform",
                })}
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            {t("settings.businessTypes.add", { defaultValue: "Add Business Type" })}
          </Button>
        </div>

        <DataTable
          columns={createBusinessTypesColumns({
            onEdit: openEditDialog,
            onDelete: (id, name) => setDeleteTarget({ id, name }),
          })}
          data={businessTypes}
          enableGlobalSearch={true}
          searchPlaceholder={
            t("table.search") +
            " " +
            t("settings.businessTypes.title", { defaultValue: "Business Types" }) +
            "..."
          }
          isLoading={isLoading}
        />
      </PageContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem
                ? t("settings.businessTypes.editTitle", { defaultValue: "Edit Business Type" })
                : t("settings.businessTypes.createTitle", { defaultValue: "Add Business Type" })}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business-type-name">
                {t("table.name", { defaultValue: "Name" })}
              </Label>
              <Input
                id="business-type-name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={t("settings.businessTypes.namePlaceholder", {
                  defaultValue: "e.g. Retail",
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-type-description">
                {t("settings.businessTypes.descriptionLabel", { defaultValue: "Description" })}
              </Label>
              <Textarea
                id="business-type-description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={t("settings.businessTypes.descriptionPlaceholder", {
                  defaultValue: "Optional description",
                })}
              />
            </div>
            {formError && <p className="text-sm text-destructive">{formError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleSubmit} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("settings.businessTypes.deleteTitle", { defaultValue: "Delete Business Type" })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("settings.businessTypes.deleteDescription", {
                defaultValue: `Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`,
              })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.delete", { defaultValue: "Delete" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function Page() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <BusinessTypesSettingsPage />
    </RoleGuard>
  );
}
