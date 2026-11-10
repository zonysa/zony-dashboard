"use client";

import { useTranslation } from "react-i18next";
import { languages, languageNames } from "@/lib/i18n/config";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useLanguage, useSetLanguage } from "@/lib/stores/user-preferences-store";

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const currentLang = useLanguage();
  const setLanguage = useSetLanguage();

  const otherLang = languages.find((lang) => lang !== currentLang) ?? languages[0];

  return (
    <Button
      variant="outline"
      onClick={() => setLanguage(otherLang)}
      lang={otherLang}
      aria-label={t("selectLanguage")}
    >
      <Globe className="h-4 w-4" />
      {languageNames[otherLang]}
    </Button>
  );
}
