"use client";

import React from "react";
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

interface BreadcrumbSegment {
  label: string;
  href: string;
  isLast: boolean;
}

function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Generate breadcrumb segments from pathname
  const getBreadcrumbSegments = (): BreadcrumbSegment[] => {
    const segments = pathname.split("/").filter(Boolean);

    const breadcrumbs: BreadcrumbSegment[] = [
      { label: "Home", href: "/", isLast: segments.length === 0 },
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
    // Handle special cases
    const specialCases: Record<string, string> = {
      pudos: "Branches",
      "customer-service": "Customer Service",
      create: "Create New",
    };

    if (specialCases[segment]) {
      return specialCases[segment];
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

  const getHeaderButton = () => {
    switch (pathname) {
      case "/partners":
        return (
          <Button size="sm" onClick={() => router.push("/partners/create")}>
            Add New Partner
          </Button>
        );
      case "/pudos":
        return (
          <Button onClick={() => router.push("/pudos/create")}>
            Add New Branch
          </Button>
        );
      case "/settings":
        return (
          <Button onClick={() => console.log("Save settings")}>Save</Button>
        );

      case "/parcels":
        return <CreateParcelSheet />;

      case "/supervisors":
        return (
          <Button size="sm" onClick={() => router.push("/supervisors/create")}>
            Create Supervisor
          </Button>
        );
      case "/customer-service":
        return (
          <Button
            size="sm"
            onClick={() => router.push("/customer-service/create")}
          >
            Create Customer Service
          </Button>
        );
      case "/courier":
        return (
          <Button onClick={() => router.push("/courier/create")}>
            Create Courier
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
            {breadcrumbSegments.map((segment, index) => (
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
          <BellDot width={22} height={22} />
          <Avatar
            onClick={handleNavigateProfile}
            className="circle border border-gray-800 w-[34px] h-[34px] cursor-pointer"
          >
            <AvatarImage alt="@evilrabbit" />
            <AvatarFallback className="text-[12px]">ER</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Header;
