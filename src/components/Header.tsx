"use client";

import React, { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { BellDot, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationDropDown } from "./ui/LocatoinDropdown";
import NotificationsSheet from "./NotificationsSheet";
import { useTranslation } from "@/lib/hooks/useTranslation";
import CreateUserSheet from "./CreateUserSheet";
import { useLanguage, useSetLanguage } from "@/lib/stores/user-preferences-store";

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [showUserSheet, setShowUserSheet] = useState(false);
  const [userRoleName, setUserRoleName] = useState<string>("");
  const { t } = useTranslation();
  const language = useLanguage();
  const setLanguage = useSetLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  // Generate breadcrumb segments from pathname
  const getBreadcrumbSegments = (): BreadcrumbSegment[] => {
    const segments = pathname.split("/").filter(Boolean);

    const breadcrumbs: BreadcrumbSegment[] = [
      { label: t("breadcrumb.home"), href: "/", isLast: segments.length === 0 },
    ];

    segments.forEach((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = formatSegment(segment);
      const isLast = index === segments.length - 1;

      breadcrumbs.push({ label, href, isLast });
    });

    return breadcrumbs;
  };

  const formatSegment = (segment: string): string => {
    // Try to get translation first
    const translationKey = `breadcrumb.${segment}` as never;
    const translated = t(translationKey);

    // If translation exists (not returning the key itself), use it
    if (translated !== translationKey) {
      return translated;
    }

    // Default formatting: capitalize first letter and replace hyphens
    return segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleAddUser = (roleName: string) => {
    if (roleName) {
      setUserRoleName(roleName);
    }
    setShowUserSheet(true);
  };

  const getHeaderButton = () => {
    switch (pathname) {
      case "/partners":
        return (
          <Button size="sm" onClick={() => router.push("/partners/create")}>
            {t("buttons.addNewPartner")}
          </Button>
        );
      case "/pudos":
        return (
          <Button size="sm" onClick={() => router.push("/pudos/create")}>
            {t("buttons.addNewBranch")}
          </Button>
        );
      case "/settings":
        return (
          <Button size="sm" onClick={() => console.log("Save settings")}>
            {t("common.save")}
          </Button>
        );
      case "/parcels":
        return (
          <Button size="sm" onClick={() => router.push("/parcels/create")}>
            {t("buttons.createParcel")}
          </Button>
        );
      case "/supervisors":
        return (
          <Button size="sm" onClick={() => handleAddUser("supervisor")}>
            {t("buttons.createSupervisor")}
          </Button>
        );
      case "/customer-service":
        return (
          <Button size="sm" onClick={() => handleAddUser("customer_service")}>
            {t("buttons.createCustomerService")}
          </Button>
        );
      case "/courier":
        return (
          <Button size="sm" onClick={() => handleAddUser("courier")}>
            {t("buttons.createCourier")}
          </Button>
        );
      case "/zones":
        return <LocationDropDown />;
      default:
        return null;
    }
  };
  const breadcrumbSegments = getBreadcrumbSegments();

  return (
    <header className="sticky w-full top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col sm:flex-row sm:h-16 shrink-0 sm:items-center gap-2 px-4 sm:px-6 py-2 sm:py-0 transition-[width,height] ease-linear border-b border-border">
      <div className="flex items-center gap-2 min-w-0">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4 shrink-0"
        />
        <Breadcrumb className="flex justify-start gap-2 items-start overflow-x-auto min-w-0">
          <BreadcrumbList className="flex-nowrap whitespace-nowrap">
            {breadcrumbSegments.map((segment) => (
              <React.Fragment key={segment.href}>
                <BreadcrumbItem>
                  {segment.isLast ? (
                    <BreadcrumbPage>{segment.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={segment.href}
                      className="cursor-pointer hover:text-foreground transition-colors"
                    >
                      {segment.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!segment.isLast && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="w-full sm:w-auto flex flex-wrap sm:flex-nowrap justify-end items-center gap-2 sm:gap-3 sm:ms-auto">
        {getHeaderButton()}
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="cursor-pointer gap-1.5 shrink-0"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">
            {language === "en" ? "العربية" : "English"}
          </span>
        </Button>
        <BellDot
          className="cursor-pointer shrink-0"
          onClick={() => setNotificationsOpen(true)}
          width={22}
          height={22}
        />
      </div>
      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <CreateUserSheet
        open={showUserSheet}
        onOpenChange={setShowUserSheet}
        userRoleName={userRoleName}
      />
    </header>
  );
}

export default Header;
