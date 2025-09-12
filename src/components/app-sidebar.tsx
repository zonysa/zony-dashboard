"use client";

import * as React from "react";
import Image from "next/image";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "/",
      icon: "overview",
    },
    {
      title: "Supervisors",
      url: "/supervisors",
      icon: "supervisors",
    },
    {
      title: "Partners",
      url: "/partners",
      icon: "partners",
    },
    {
      title: "PUDO Points",
      url: "/pudos",
      icon: "pudos",
    },
    {
      title: "Zones",
      url: "/zones",
      icon: "zones",
    },
    {
      title: "Reports & Analytics",
      url: "/reports-analytics",
      icon: "reports-analytics",
    },
    {
      title: "System Alerts",
      url: "/system-alerts",
      icon: "system-alerts",
    },
    {
      title: "Roles & Permissions",
      url: "/roles-permissions",
      icon: "roles-permissions",
    },
    {
      title: "Parcels",
      url: "/parcels",
      icon: "parcels",
    },
    {
      title: "Clients",
      url: "/clients",
      icon: "clients",
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: "tickets",
    },
    {
      title: "Customer Service",
      url: "protected/customer-service",
      icon: "customer-service",
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: "settings",
    },
    {
      title: "Logout",
      url: "#",
      icon: "logout",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="ps-6 pt-8">
        <Image src="/icons/zony-logo.svg" alt="Logo" width={74} height={36} />
      </SidebarHeader>
      <SidebarContent className="mt-4 ms-3">
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
