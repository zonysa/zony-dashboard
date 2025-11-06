"use client";

import { AppSidebar } from "@/components/app-sidebar";
import Header from "@/components/Header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RoutePermissionGuard } from "@/components/auth/RoutePermissionGuard";
import { useTranslation } from "@/lib/hooks/useTranslation";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isRTL } = useTranslation();
  return (
    <ProtectedRoute>
      <RoutePermissionGuard>
        <SidebarProvider>
          <AppSidebar side={isRTL ? "right" : "left"} />
          <SidebarInset>
            <Header />
            <div className="w-full mt-16">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </RoutePermissionGuard>
    </ProtectedRoute>
  );
}
