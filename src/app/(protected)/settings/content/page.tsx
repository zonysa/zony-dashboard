"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/PageContainer";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useSiteContentSections,
  useUpdateSiteContentSection,
} from "@/lib/hooks/useSiteContent";
import { SITE_CONTENT_SECTIONS } from "@/lib/config/siteContentFields";
import { SectionForm } from "@/components/content/SectionForm";
import { SiteContentValue } from "@/lib/schema/siteContent.schema";

function ContentSettingsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useSiteContentSections();
  const updateMutation = useUpdateSiteContentSection();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftAr, setDraftAr] = useState<SiteContentValue>({});
  const [draftEn, setDraftEn] = useState<SiteContentValue>({});

  const sections = data?.sections ?? [];
  const editingSpec = SITE_CONTENT_SECTIONS.find((s) => s.key === editingKey);

  const openEditDialog = (sectionKey: string) => {
    const row = sections.find((s) => s.section_key === sectionKey);
    setEditingKey(sectionKey);
    setDraftAr(row?.content_ar ?? (SITE_CONTENT_SECTIONS.find((s) => s.key === sectionKey)?.isArrayRoot ? [] : {}));
    setDraftEn(row?.content_en ?? (SITE_CONTENT_SECTIONS.find((s) => s.key === sectionKey)?.isArrayRoot ? [] : {}));
  };

  const handleSave = async () => {
    if (!editingKey) return;
    try {
      await updateMutation.mutateAsync({
        sectionKey: editingKey,
        data: { content_ar: draftAr, content_en: draftEn },
      });
      setEditingKey(null);
    } catch {
      // errors are surfaced via toast in the mutation hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <PageContainer size="lg">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">
              {t("settings.content.title", { defaultValue: "Site Content" })}
            </h1>
            <p className="text-gray-500 text-sm">
              {t("settings.content.description", {
                defaultValue: "Edit the zony-portfolio marketing site's copy, in Arabic and English",
              })}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SITE_CONTENT_SECTIONS.map((spec) => (
              <Card key={spec.key}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{spec.label}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(spec.key)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    {sections.find((s) => s.section_key === spec.key)
                      ? t("settings.content.editSection", { defaultValue: "Click to edit" })
                      : t("settings.content.notSeeded", {
                          defaultValue: "Not seeded yet -- run flask seed-site-content",
                        })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>

      <Dialog open={!!editingKey} onOpenChange={(open) => !open && setEditingKey(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSpec?.label}</DialogTitle>
          </DialogHeader>

          {editingSpec && (
            <Tabs defaultValue="ar">
              <TabsList>
                <TabsTrigger value="ar">Arabic</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="ar" className="pt-4">
                <SectionForm
                  spec={editingSpec}
                  value={draftAr}
                  onChange={(v) => setDraftAr(v as SiteContentValue)}
                />
              </TabsContent>
              <TabsContent value="en" className="pt-4">
                <SectionForm
                  spec={editingSpec}
                  value={draftEn}
                  onChange={(v) => setDraftEn(v as SiteContentValue)}
                />
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingKey(null)}>
              {t("common.cancel", { defaultValue: "Cancel" })}
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save", { defaultValue: "Save" })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function Page() {
  return (
    <RoleGuard allowedRoles={["admin"]}>
      <ContentSettingsPage />
    </RoleGuard>
  );
}
