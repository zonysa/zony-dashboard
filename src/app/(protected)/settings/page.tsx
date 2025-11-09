"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DataItem from "@/components/ui/DataItem";
import { Globe } from "lucide-react";
import { toast } from "sonner";
import { useLanguage, useSetLanguage } from "@/lib/stores/user-preferences-store";
import { languageNames } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/hooks/useTranslation";

type Language = "en" | "ar";

const SettingsPage = () => {
  const { t } = useTranslation();
  const currentLanguage = useLanguage();
  const setLanguage = useSetLanguage();

  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(currentLanguage);

  const handleSaveLanguage = () => {
    setLanguage(selectedLanguage);
    setIsEditingLanguage(false);
    toast.success(t("settings.languageUpdated", { defaultValue: "Language updated successfully" }));
  };

  const handleCancelLanguage = () => {
    setSelectedLanguage(currentLanguage);
    setIsEditingLanguage(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Language Preferences Card */}
      <Card className="flex flex-row border-0 border-b rounded-none shadow-none px-6">
        <DataItem
          isHeading={true}
          label={t("settings.languagePreferences", { defaultValue: "Language Preferences" })}
          value={t("settings.languageDescription", { defaultValue: "Choose your preferred language for the interface" })}
          icon={Globe}
          iconClassName="text-black"
        />
        <CardContent className="w-2/4 flex-1 space-y-3">
          <div className="grid grid-cols-1 gap-3">
            <DataItem
              label={t("settings.language", { defaultValue: "Interface Language" })}
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
                  {t("settings.rtlNote", { defaultValue: "Arabic language uses right-to-left (RTL) text direction" })}
                </p>
              ) : (
                <p>
                  {t("settings.ltrNote", { defaultValue: "English language uses left-to-right (LTR) text direction" })}
                </p>
              )}
            </div>
          </div>
        </CardContent>
        <div className="flex gap-2">
          {isEditingLanguage ? (
            <>
              <Button
                onClick={handleSaveLanguage}
                variant="default"
              >
                {t("common.save", { defaultValue: "Save Changes" })}
              </Button>
              <Button
                onClick={handleCancelLanguage}
                variant="outline"
              >
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

      {/* Future Settings Sections */}
      {/* Add more settings cards here following the same pattern */}
    </div>
  );
};

export default SettingsPage;
