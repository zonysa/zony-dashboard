"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "@/lib/i18n/config";
import { useUserPreferencesStore } from "@/lib/stores/user-preferences-store";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const language = useUserPreferencesStore((state) => state.language);

  useEffect(() => {
    // Use language from Zustand store
    i18next.changeLanguage(language).then(() => {
      setIsInitialized(true);
    });
  }, [language]);

  // Show loading or null while initializing
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
