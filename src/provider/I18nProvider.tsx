"use client";

import { ReactNode, useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "@/lib/i18n/config";

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Get the saved language from localStorage or use default
    const savedLanguage = localStorage.getItem("language") || "en";

    i18next.changeLanguage(savedLanguage).then(() => {
      setIsInitialized(true);

      // Update HTML attributes for RTL support
      document.documentElement.lang = savedLanguage;
      document.documentElement.dir = savedLanguage === "ar" ? "rtl" : "ltr";
    });
  }, []);

  // Show loading or null while initializing
  if (!isInitialized) {
    return null;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
