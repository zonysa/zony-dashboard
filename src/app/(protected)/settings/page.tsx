"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataItem from "@/components/ui/DataItem";
import { Globe, BarChart3, Briefcase, Warehouse, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  useLanguage,
  useSetLanguage,
} from "@/lib/stores/user-preferences-store";
import { languageNames } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { useRouter } from "next/navigation";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { Can } from "@/components/auth/Can";
import { Permission } from "@/lib/rbac/permissions";
import { PageContainer } from "@/components/PageContainer";

type Language = "en" | "ar";

const SettingsPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const currentLanguage = useLanguage();
  const setLanguage = useSetLanguage();

  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] =
    useState<Language>(currentLanguage);

  const handleSaveLanguage = () => {
    setLanguage(selectedLanguage);
    setIsEditingLanguage(false);
    toast.success(
      t("settings.languageUpdated", {
        defaultValue: "Language updated successfully",
      })
    );
  };

  const handleCancelLanguage = () => {
    setSelectedLanguage(currentLanguage);
    setIsEditingLanguage(false);
  };

  return (
    <PageContainer size="xl" className="flex flex-col gap-6 p-4 sm:p-6">
      {/* Language Preferences Card */}
      <Card className="flex flex-col sm:flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("settings.languagePreferences", {
            defaultValue: "Language Preferences",
          })}
          value={t("settings.languageDescription", {
            defaultValue: "Choose your preferred language for the interface",
          })}
          icon={Globe}
          iconClassName="text-black"
        />
        <CardContent className="w-full sm:w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <DataItem
              label={t("settings.language", {
                defaultValue: "Interface Language",
              })}
              value={languageNames[selectedLanguage]}
              type="select"
              isEditable={isEditingLanguage}
              selectOptions={[
                { value: "en", label: languageNames.en },
                { value: "ar", label: languageNames.ar },
              ]}
              onChange={(value) => setSelectedLanguage(value as Language)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="text-sm text-gray-500">
              {currentLanguage === "ar" ? (
                <p>
                  {t("settings.rtlNote", {
                    defaultValue:
                      "Arabic language uses right-to-left (RTL) text direction",
                  })}
                </p>
              ) : (
                <p>
                  {t("settings.ltrNote", {
                    defaultValue:
                      "English language uses left-to-right (LTR) text direction",
                  })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <div className="flex gap-2">
          {isEditingLanguage ? (
            <>
              <Button onClick={handleSaveLanguage} variant="default">
                {t("common.save", { defaultValue: "Save Changes" })}
              </Button>
              <Button onClick={handleCancelLanguage} variant="outline">
                {t("common.cancel", { defaultValue: "Cancel" })}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditingLanguage(true)}
              variant="outline"
            >
              {t("common.edit", { defaultValue: "Edit" })}
            </Button>
          )}
        </div>
      </Card>

      {/* KPI Settings Card */}
      <Card className="flex flex-col sm:flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("settings.kpi.title", {
            defaultValue: "KPI Settings",
          })}
          value={t("settings.kpi.description", {
            defaultValue: "Configure threshold zones for each KPI metric",
          })}
          icon={BarChart3}
          iconClassName="text-black"
        />
        <CardContent className="w-full sm:w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <div className="text-sm text-gray-500">
              <p>
                {t("settings.kpi.settingsDescription", {
                  defaultValue:
                    "Define red, yellow, and green zones for your KPI metrics to track performance thresholds.",
                })}
              </p>
            </div>
          </div>
        </CardContent>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/settings/kpis")}
            variant="outline"
          >
            {t("settings.kpi.configure", { defaultValue: "Configure" })}
          </Button>
        </div>
      </Card>

      {/* Business Types Settings Card */}
      <RoleGuard allowedRoles={["admin"]} fallback={null}>
        <Card className="flex flex-col sm:flex-row border-0 border-b rounded-none shadow-none px-6">
          <DataItem
            isHeading={true}
            label={t("settings.businessTypes.title", {
              defaultValue: "Business Types",
            })}
            value={t("settings.businessTypes.description", {
              defaultValue:
                "Manage the list of business types available across the platform",
            })}
            icon={Briefcase}
            iconClassName="text-black"
          />
          <CardContent className="w-full sm:w-2/4 flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-sm text-gray-500">
                <p>
                  {t("settings.businessTypes.settingsDescription", {
                    defaultValue:
                      "Add, edit, or remove business types used to categorize clients and partners.",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/settings/business-types")}
              variant="outline"
            >
              {t("settings.businessTypes.configure", { defaultValue: "Configure" })}
            </Button>
          </div>
        </Card>
      </RoleGuard>

      {/* Warehouse Settings Card — gated on the warehouse-specific permission
          (admin/supervisor), which `responsible` does not hold even though it
          can open the rest of the warehouse section. */}
      <Can do={Permission.VIEW_WAREHOUSE_SETTINGS}>
        <Card className="flex flex-col sm:flex-row border-0 border-b rounded-none shadow-none px-6">
          <DataItem
            isHeading={true}
            label={t("settings.warehouse.title", {
              defaultValue: "Warehouse Settings",
            })}
            value={t("settings.warehouse.description", {
              defaultValue: "Runtime configuration for the warehouse pilot",
            })}
            icon={Warehouse}
            iconClassName="text-black"
          />
          <CardContent className="w-full sm:w-2/4 flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-sm text-gray-500">
                <p>
                  {t("settings.warehouse.settingsDescription", {
                    defaultValue:
                      "Slot capacity, scheduling horizon, reminder timings, message safety rails, and message templates.",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/settings/warehouse")}
              variant="outline"
            >
              {t("settings.warehouse.configure", { defaultValue: "Configure" })}
            </Button>
          </div>
        </Card>
      </Can>

      {/* Site Content Settings Card */}
      <RoleGuard allowedRoles={["admin"]} fallback={null}>
        <Card className="flex flex-col sm:flex-row border-0 border-b rounded-none shadow-none px-6">
          <DataItem
            isHeading={true}
            label={t("settings.content.title", {
              defaultValue: "Site Content",
            })}
            value={t("settings.content.description", {
              defaultValue:
                "Edit the zony-portfolio marketing site's copy, in Arabic and English",
            })}
            icon={FileText}
            iconClassName="text-black"
          />
          <CardContent className="w-full sm:w-2/4 flex-1 space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <div className="text-sm text-gray-500">
                <p>
                  {t("settings.content.settingsDescription", {
                    defaultValue:
                      "Edit hero, about, solutions, FAQ, and every other section shown on zony.sa -- changes go live within a minute, no redeploy needed.",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/settings/content")}
              variant="outline"
            >
              {t("settings.content.configure", { defaultValue: "Configure" })}
            </Button>
          </div>
        </Card>
      </RoleGuard>

      {/* Future Settings Sections */}
      {/* Add more settings cards here following the same pattern */}
    </PageContainer>
  );
};

export default SettingsPage;
