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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { BellDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LocationDropDown } from "./ui/LocatoinDropdown";
import CreateParcelSheet from "./CreateParcelDiaglog";
import NotificationsSheet from "./NotificationsSheet";
import { useTranslation } from "@/lib/hooks/useTranslation";
import CreateUserSheet from "./CreateUserSheet";

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
  const [userRoleId, setUserRoleId] = useState<number>(0);
  const { t } = useTranslation();

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

  const handleNavigateProfile = () => {
    router.push("/profile");
  };

  const handleAddUser = (roleId: number) => {
    if (roleId) {
      setUserRoleId(roleId);
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
          <Button onClick={() => router.push("/pudos/create")}>
            {t("buttons.addNewBranch")}
          </Button>
        );
      case "/settings":
        return (
          <Button onClick={() => console.log("Save settings")}>
            {t("common.save")}
          </Button>
        );
      case "/parcels":
        return <CreateParcelSheet />;
      case "/supervisors":
        return (
          <Button size="sm" onClick={() => handleAddUser(4)}>
            {t("buttons.createSupervisor")}
          </Button>
        );
      case "/customer-service":
        return (
          <Button size="sm" onClick={() => handleAddUser(5)}>
            {t("buttons.createCustomerService")}
          </Button>
        );
      case "/courier":
        return (
          <Button onClick={() => handleAddUser(6)}>
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
    <header className="fixed w-[90%] top-0 z-40 pe-32 ps-6 bg-background/95 backdrblur supports-[backdropop--filter]:bg-background/60 flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:w-12/12 group-has-data-[collapsible=icon]/sidebar-wrapper:pe-12 border-b border-border">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div className="w-full flex justify-between items-center gap-2 px-4">
        <Breadcrumb className="flex justify-start gap-2 items-start">
          <BreadcrumbList>
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
        <div className="w-auto flex justify-end items-center gap-3">
          {getHeaderButton()}
          <BellDot
            className="cursor-pointer"
            onClick={() => setNotificationsOpen(true)}
            width={22}
            height={22}
          />
          <Avatar
            onClick={handleNavigateProfile}
            className="circle border border-gray-800 w-[34px] h-[34px] cursor-pointer"
          >
            <AvatarImage alt="@evilrabbit" />
            <AvatarFallback className="text-[12px]">ER</AvatarFallback>
          </Avatar>
        </div>
      </div>
      <NotificationsSheet
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
      <CreateUserSheet
        open={showUserSheet}
        onOpenChange={setShowUserSheet}
        userRole={userRoleId}
      />
    </header>
  );
}

export default Header;
