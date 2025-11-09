"use client";

import { useLanguage } from "@/lib/stores/user-preferences-store";

interface HtmlWrapperProps {
  children: React.ReactNode;
}

export function HtmlWrapper({ children }: HtmlWrapperProps) {
  const language = useLanguage();
  const isRTL = language === "ar";
  const fontClass = isRTL ? "font-cairo" : "font-poppins";

  return (
    <html
      lang={language}
      dir={isRTL ? "rtl" : "ltr"}
      className={fontClass}
      suppressHydrationWarning
    >
      {children}
    </html>
  );
}
