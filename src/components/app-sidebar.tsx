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
  Inbox,
  PackageCheck,
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
      title: t("leads.title"),
      url: "/leads",
      icon: Inbox,
      permission: Permission.VIEW_LEADS,
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
      // Sub-items carry their own permission: `warehouse_clerk` holds
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
          title: t("warehouse.nav.returnsQueue"),
          url: "/warehouse/returns-queue",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.courierActions"),
          url: "/warehouse/courier-actions",
          permission: Permission.ACT_FOR_COURIERS,
        },
        {
          title: t("warehouse.nav.pudoReturns"),
          url: "/warehouse/pudo-returns",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.dispatch"),
          url: "/warehouse/dispatch",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.batches"),
          url: "/warehouse/batches",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.merchants"),
          url: "/warehouse/merchants",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.carriers"),
          url: "/warehouse/carriers",
          permission: Permission.VIEW_WAREHOUSE,
        },
        {
          title: t("warehouse.nav.report"),
          url: "/warehouse/report",
          permission: Permission.VIEW_WAREHOUSE_REPORTS,
        },
        {
          title: t("warehouse.nav.warehouses"),
          url: "/warehouse/warehouses",
          permission: Permission.VIEW_WAREHOUSE_SETTINGS,
        },
      ],
    },
    {
      title: t("warehouseCourierNav.title"),
      url: "/warehouse/courier",
      icon: Truck,
      permission: Permission.VIEW_WAREHOUSE_COURIER,
    },
    {
      // Top-level, not nested under "warehouse" above: a `responsible` holds
      // this permission but not VIEW_WAREHOUSE, and nesting it would either
      // hide it (group gated on the parent permission) or show that role an
      // otherwise-empty warehouse drawer.
      title: t("warehousePudoHandovers.navTitle"),
      url: "/warehouse/pudo-handovers",
      icon: PackageCheck,
      permission: Permission.VIEW_PUDO_HANDOVERS,
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
