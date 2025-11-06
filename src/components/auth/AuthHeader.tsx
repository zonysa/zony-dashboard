"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { useTranslation } from "@/lib/hooks/useTranslation";

function AuthHeader() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const getTitle = () => {
    switch (pathname) {
      case "/auth/login":
        return t("auth.login.title");
      case "/auth/request-password":
        return t("auth.requestPassword.title");
      default:
        return t("auth.resetPassword.title");
    }
  };

  return (
    <div className="flex w-full justify-between items-center">
      <Image src="/icons/zony-logo.svg" alt="Logo" width={80} height={40} />
      <h1 className="text-xl font-semibold">{getTitle()}</h1>
      <LanguageSwitcher />
    </div>
  );
}

export default AuthHeader;
