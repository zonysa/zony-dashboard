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
      case "/auth/signup":
        return t("auth.signup.title");
      case "/auth/verify-otp":
        return t("auth.verifyOtp.title");
      case "/auth/request-password":
        return t("auth.requestPassword.title");
      default:
        return t("auth.resetPassword.title");
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-x-3 gap-y-2">
      <Image
        src="/icons/zony-logo.png"
        alt="Logo"
        width={80}
        height={40}
        className="h-8 w-auto sm:h-10"
      />
      <h1 className="order-3 w-full text-center text-lg font-semibold truncate sm:order-none sm:w-auto sm:text-xl">
        {getTitle()}
      </h1>
      <LanguageSwitcher />
    </div>
  );
}

export default AuthHeader;
