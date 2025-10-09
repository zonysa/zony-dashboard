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
import { BellDot, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreateZone } from "@/forms/CreateZone";

function Header() {
  const [openCreateZone, setOpenCreateZone] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const formatPathname = (path: string) => {
    return path.replace(/^\//, "").charAt(0).toUpperCase() + path.slice(2);
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
        return (
          <Button size="sm" onClick={() => router.push("/parcles/create")}>
            Create Parcel
          </Button>
        );
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
        return (
          <div>
            <Button size="sm" onClick={() => setOpenCreateZone(true)}>
              Create Zone
              <Plus />
            </Button>
            <CreateZone
              open={openCreateZone}
              onOpenChange={setOpenCreateZone}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="fixed w-[90%] top-0 z-40 pe-32 ps-6 bg-background/95 backdrblur supports-[backdropop--filter]:bg-background/60 flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:w-12/12 group-has-data-[collapsible=icon]/sidebar-wrapper:pe-12 border-b border-border">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <div className="w-full flex justify-between items-center gap-2 px-4">
        <Breadcrumb className="flex justify-start gap-2 items-start">
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#">
                {formatPathname(pathname)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage></BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="w-auto flex justify-end items-center gap-3">
          {getHeaderButton()}
          <BellDot width={22} height={22} />
          <Avatar className="circle border border-gray-800 w-[34px] h-[34px]">
            <AvatarImage alt="@evilrabbit" />
            <AvatarFallback className="text-[12px]">ER</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}

export default Header;
