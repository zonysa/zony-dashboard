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
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";
import { LogoutDialog } from "./LogoutDialog";
import { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Navigation items with required permissions

// Inner component that uses useSidebar hook
function AppSidebarContent() {
  const { t } = useTranslation();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { state } = useSidebar();

  const navItems = [
    {
      title: t("overview.title"),
      url: "/",
      icon: LayoutDashboard,
      permission: Permission.VIEW_DASHBOARD,
    },
    {
      title: t("supervisors.title"),
      url: "/supervisors",
      icon: Users,
      permission: Permission.VIEW_SUPERVISORS,
    },
    {
      title: t("partners.title"),
      url: "/partners",
      icon: UserRound,
      permission: Permission.VIEW_PARTNERS,
    },
    {
      title: t("pudos.title"),
      url: "/pudos",
      icon: Store,
      permission: Permission.VIEW_PUDOS,
    },
    {
      title: t("zones.title"),
      url: "/zones",
      icon: Map,
      permission: Permission.VIEW_ZONES,
    },
    {
      title: t("reportsAnalytics.title"),
      url: "/reports-analytics",
      icon: BarChart3,
      permission: Permission.VIEW_REPORTS,
    },
    {
      title: t("parcels.title"),
      url: "/parcels",
      icon: Package,
      permission: Permission.VIEW_PARCELS,
    },
    {
      title: t("clients.title"),
      url: "/clients",
      icon: Handshake,
      permission: Permission.VIEW_CLIENTS,
    },
    {
      title: t("tickets.title"),
      url: "/tickets",
      icon: Ticket,
      permission: Permission.VIEW_TICKETS,
    },
    {
      title: t("customerService.title"),
      url: "/customer-service",
      icon: Headset,
      permission: Permission.VIEW_CUSTOMER_SERVICE,
    },
    {
      title: t("couriers.title"),
      url: "/courier",
      icon: Truck,
      permission: Permission.VIEW_COURIER,
    },
  ];

  const navSecondary = [
    {
      title: t("settings.title"),
      url: "/settings",
      icon: Settings,
    },
    {
      title: t("logout.title"),
      icon: LogOut,
      onClick: () => setLogoutDialogOpen(true),
    },
  ];
  // Filter navigation items based on user permissions
  const filteredNavItems = React.useMemo(() => {
    return navItems.filter((item) => hasPermission(item.permission));
  }, [hasPermission, navItems]);

  return (
    <>
      <SidebarHeader className="ps-4 pe-3 pt-6">
        {state === "expanded" ? (
          <Image src="/icons/zony-logo.svg" alt="Logo" width={74} height={36} />
        ) : (
          <Image src="/icons/mini-logo.svg" alt="Logo" width={46} height={46} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarRail />
      <LogoutDialog
        open={logoutDialogOpen}
        onOpenChange={setLogoutDialogOpen}
      />
    </>
  );
}

// Main component wrapper
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <AppSidebarContent />
    </Sidebar>
  );
}
