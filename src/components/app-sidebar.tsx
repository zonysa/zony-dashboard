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
import { useAuthStore } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";
import { LogoutDialog } from "./LogoutDialog";
import { useState } from "react";

// Navigation items with required permissions

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  const navItems = [
    {
      title: "Overview",
      url: "/",
      icon: LayoutDashboard,
      permission: Permission.VIEW_DASHBOARD,
    },
    {
      title: "Supervisors",
      url: "/supervisors",
      icon: Users,
      permission: Permission.VIEW_SUPERVISORS,
    },
    {
      title: "Partners",
      url: "/partners",
      icon: UserRound,
      permission: Permission.VIEW_PARTNERS,
    },
    {
      title: "PUDO Points",
      url: "/pudos",
      icon: Store,
      permission: Permission.VIEW_PUDOS,
    },
    {
      title: "Zones",
      url: "/zones",
      icon: Map,
      permission: Permission.VIEW_ZONES,
    },
    {
      title: "Reports & Analytics",
      url: "/reports-analytics",
      icon: BarChart3,
      permission: Permission.VIEW_REPORTS,
    },
    {
      title: "Parcels",
      url: "/parcels",
      icon: Package,
      permission: Permission.VIEW_PARCELS,
    },
    {
      title: "Clients",
      url: "/clients",
      icon: Handshake,
      permission: Permission.VIEW_CLIENTS,
    },
    {
      title: "Tickets",
      url: "/tickets",
      icon: Ticket,
      permission: Permission.VIEW_TICKETS,
    },
    {
      title: "Customer Service",
      url: "/customer-service",
      icon: Headset,
      permission: Permission.VIEW_CUSTOMER_SERVICE,
    },
    {
      title: "Courier",
      url: "/courier",
      icon: Truck,
      permission: Permission.VIEW_COURIER,
    },
  ];

  const navSecondary = [
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: () => setLogoutDialogOpen(true),
    },
  ];
  // Filter navigation items based on user permissions
  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => hasPermission(item.permission));
  }, [hasPermission]);

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="ps-6 pt-8">
          <Image src="/icons/zony-logo.svg" alt="Logo" width={74} height={36} />
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={filteredNavItems} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </>
  );
}
