"use client";

import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { getRoutePermissions, canAccessRoute } from "@/lib/rbac/route-permissions";
import { getRolePermissions } from "@/lib/rbac/permissions";
import { AccessDenied } from "./AccessDenied";

interface RoutePermissionGuardProps {
  children: ReactNode;
}

/**
 * RoutePermissionGuard - Automatic route protection based on pathname
 *
 * This component automatically checks if the current user has permission
 * to access the current route based on the ROUTE_PERMISSIONS configuration.
 *
 * Place this in your layout to protect all child routes automatically.
 *
 * Benefits:
 * - No need to add guards to individual pages
 * - Centralized permission configuration
 * - Easy to maintain and update
 * - Automatic protection for new routes when added to config
 */
export function RoutePermissionGuard({ children }: RoutePermissionGuardProps) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    // If no user, deny access (will be handled by ProtectedRoute)
    if (!user) {
      setHasAccess(false);
      return;
    }

    // Get user's permissions based on role string
    const userPermissions = getRolePermissions(user.role);

    // Check if user can access this route
    const canAccess = canAccessRoute(pathname, userPermissions);
    setHasAccess(canAccess);
  }, [pathname, user]);

  // Loading state - show nothing while checking
  if (hasAccess === null) {
    return null;
  }

  // No access - show Access Denied page
  if (!hasAccess) {
    const routeConfig = getRoutePermissions(pathname);
    console.log(
      `Access denied to ${pathname}. Required:`,
      routeConfig?.permission,
      "User role:",
      user?.role
    );
    return <AccessDenied />;
  }

  // Has access - render children
  return <>{children}</>;
}
