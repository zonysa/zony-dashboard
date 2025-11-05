"use client";

import { useTranslation as useI18nTranslation } from "react-i18next";

/**
 * Custom hook for translations
 * @param namespace - The translation namespace to use (default: 'common')
 * @returns Translation function and i18n instance
 */
export function useTranslation(namespace: string = "common") {
  const { t, i18n } = useI18nTranslation(namespace);

  return {
    t,
    i18n,
    currentLanguage: i18n.language,
    isRTL: i18n.language === "ar",
  };
}
