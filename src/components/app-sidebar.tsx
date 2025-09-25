"use client";

import * as React from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Users,
  Package,
  BarChart3,
  Settings,
  Map,
  Bell,
  Ticket,
  LogOut,
  Handshake,
  Store,
  UserRound,
  Headset,
  Truck,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
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
      icon: LayoutDashboard,
    },
    {
      title: "Supervisors",
      url: "/supervisors",
      icon: Users,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: UserRound,
    },
    {
      title: "PUDO Points",
      url: "/pudos",
      icon: Store,
    },
    {
      title: "Zones",
      url: "/zones",
      icon: Map,
    },
    {
      title: "Reports & Analytics",
      url: "/reports-analytics",
      icon: BarChart3,
    },
    // {
    //   title: "System Alerts",
    //   url: "/system-alerts",
    //   icon: Bell,
    // },
    // {
    //   title: "Roles & Permissions",
    //   url: "/roles-permissions",
    //   icon: Settings,
    // },
    {
      title: "Parcels",
      url: "/parcels",
      icon: Package,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Handshake,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
    },
    {
      title: "Customer Service",
      url: "/customer-service",
      icon: Headset,
    },
    {
      title: "Courier",
      url: "/courier",
      icon: Truck,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Logout",
      url: "#",
      icon: LogOut,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="ps-6 pt-8">
        <Image src="/icons/zony-logo.svg" alt="Logo" width={74} height={36} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
