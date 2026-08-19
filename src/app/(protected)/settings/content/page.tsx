"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageContainer } from "@/components/PageContainer";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { ArrowLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/hooks/useTranslation";
import {
  useSiteContentSections,
  useUpdateSiteContentSection,
} from "@/lib/hooks/useSiteContent";
import { SITE_CONTENT_SECTIONS } from "@/lib/config/siteContentFields";
import { SectionForm } from "@/components/content/SectionForm";
import { SiteContentValue } from "@/lib/schema/siteContent.schema";

function ContentSettingsPage() {
  const { t, isRTL } = useTranslation();
  const router = useRouter();

  const { data, isLoading } = useSiteContentSections();
  const updateMutation = useUpdateSiteContentSection();

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [draftAr, setDraftAr] = useState<SiteContentValue>({});
  const [draftEn, setDraftEn] = useState<SiteContentValue>({});

  const sections = data?.sections ?? [];
  const editingSpec = SITE_CONTENT_SECTIONS.find((s) => s.key === editingKey);

  // Section titles mirror the headings the portfolio site itself renders
  // (zony-portfolio lib/fallbackContent.ts); spec.label is the en fallback.
  const sectionLabel = (key: string, fallback: string) =>
    t(`settings.content.sections.${key}`, { defaultValue: fallback });

  const selectSection = (sectionKey: string) => {
    const spec = SITE_CONTENT_SECTIONS.find((s) => s.key === sectionKey);
    const row = sections.find((s) => s.section_key === sectionKey);
    const empty = () => (spec?.isArrayRoot ? [] : {});
    setEditingKey(sectionKey);
    setDraftAr(row?.content_ar ?? empty());
    setDraftEn(row?.content_en ?? empty());
  };

  const handleSave = async () => {
    if (!editingKey) return;
    try {
      await updateMutation.mutateAsync({
        sectionKey: editingKey,
        data: { content_ar: draftAr, content_en: draftEn },
      });
    } catch {
      // errors are surfaced via toast in the mutation hook
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <PageContainer size="xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className={cn("h-5 w-5", isRTL && "rotate-180")} />
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
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Floating sticky section column -- one row per section */}
            <aside className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-8">
              <Card className="overflow-hidden py-0">
                <CardContent className="p-0">
                  <ul className="divide-y">
                    {SITE_CONTENT_SECTIONS.map((spec) => {
                      const seeded = sections.some((s) => s.section_key === spec.key);
                      const active = editingKey === spec.key;
                      return (
                        <li key={spec.key}>
                          <button
                            type="button"
                            onClick={() => selectSection(spec.key)}
                            className={cn(
                              "w-full flex items-center justify-between gap-3 px-4 py-3 text-start transition-colors",
                              active ? "bg-gray-100" : "hover:bg-gray-50"
                            )}
                          >
                            <span className="min-w-0">
                              <span
                                className={cn(
                                  "block truncate text-sm",
                                  active ? "font-semibold" : "font-medium"
                                )}
                              >
                                {sectionLabel(spec.key, spec.label)}
                              </span>
                              {!seeded && (
                                <span className="block text-xs text-amber-600">
                                  {t("settings.content.notSeeded", {
                                    defaultValue: "Not seeded yet -- run flask seed-site-content",
                                  })}
                                </span>
                              )}
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-4 w-4 shrink-0 text-gray-400",
                                isRTL && "rotate-180"
                              )}
                            />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CardContent>
              </Card>
            </aside>

            <div className="flex-1 min-w-0 w-full">
              {editingSpec ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {sectionLabel(editingSpec.key, editingSpec.label)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ar" key={editingSpec.key}>
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

                    <div className="flex justify-end gap-2 pt-6">
                      <Button variant="outline" onClick={() => setEditingKey(null)}>
                        {t("common.cancel", { defaultValue: "Cancel" })}
                      </Button>
                      <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        {t("common.save", { defaultValue: "Save" })}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-sm text-gray-500">
                    {t("settings.content.selectSection", {
                      defaultValue: "Select a section to edit its content",
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </PageContainer>
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
