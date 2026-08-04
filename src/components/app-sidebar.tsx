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
  Warehouse,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore, useUser } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";
import { LogoutDialog } from "./LogoutDialog";
import { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

// Navigation items with required permissions

// Inner component that uses useSidebar hook
function AppSidebarContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const user = useUser();

  const hasPermission = useAuthStore((state) => state.hasPermission);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { state } = useSidebar();

  const userDisplayName =
    `${user?.first_name || ""} ${user?.last_name || ""}`.trim() || user?.username;
  const userInitials =
    `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}`.toUpperCase() ||
    userDisplayName?.[0]?.toUpperCase();

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
    {
      title: t("warehouse.title"),
      url: "/warehouse",
      icon: Warehouse,
      permission: Permission.VIEW_WAREHOUSE,
      // Sub-items carry their own permission: `responsible` holds
      // VIEW_WAREHOUSE but not reports, so gating the group as a whole would
      // hand that role a link it can't open. Warehouse settings aren't listed
      // here — they live under /settings with the platform's other config.
      items: [
        {
          title: t("warehouse.nav.overview"),
          url: "/warehouse",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.receiving"),
          url: "/warehouse/receiving",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.wall"),
          url: "/warehouse/wall",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.loading"),
          url: "/warehouse/loading",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.return"),
          url: "/warehouse/return",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.report"),
          url: "/warehouse/report",
          permission: Permission.VIEW_WAREHOUSE_REPORTS,
        },
      ],
    },
    {
      title: t("warehouseCourierNav.title"),
      url: "/warehouse/courier",
      icon: Truck,
      permission: Permission.VIEW_WAREHOUSE_COURIER,
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
  // Filter navigation items — and each group's children — by permission, then
  // drop the `permission` field so what reaches NavMain is pure nav data.
  // Not memoized: `navItems` is rebuilt every render (it closes over `t`), so a
  // memo keyed on it would never hit.
  const filteredNavItems = navItems
    .filter((item) => hasPermission(item.permission))
    .map((item) => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
      items: item.items
        ?.filter((sub) => hasPermission(sub.permission))
        .map((sub) => ({ title: sub.title, url: sub.url })),
    }))
    // A group whose children all filtered out would render an empty drawer.
    .filter((item) => !item.items || item.items.length > 0);

  return (
    <>
      <SidebarHeader className="relative z-10 ps-4 pe-3 pt-3 pb-2 shadow-[0_4px_6px_-4px_rgba(0,0,0,0.12)]">
        {state === "expanded" ? (
          <Image src="/icons/zony-logo.png" alt="Logo" width={74} height={36} />
        ) : (
          <Image src="/icons/mini-logo.png" alt="Logo" width={46} height={46} />
        )}
      </SidebarHeader>
      <SidebarContent className="sidebar-scroll">
        <NavMain items={filteredNavItems} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="relative z-10 shadow-[0_-4px_6px_-4px_rgba(0,0,0,0.12)]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer"
              onClick={() => router.push("/profile")}
            >
              <Avatar className="w-[28px] h-[28px] border border-gray-800 shrink-0">
                <AvatarImage alt={userDisplayName} />
                <AvatarFallback className="text-[11px]">
                  {userInitials || "U"}
                </AvatarFallback>
              </Avatar>
              {state === "expanded" && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="truncate text-sm font-medium leading-tight">
                    {userDisplayName}
                  </span>
                  {user?.email && (
                    <span className="truncate text-xs text-muted-foreground leading-tight">
                      {user.email}
                    </span>
                  )}
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
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
