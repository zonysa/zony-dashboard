"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";
import { AccessDenied } from "./AccessDenied";

interface PermissionGuardProps {
  children: ReactNode;
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGuardProps) {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);

  const permissionsArray = Array.isArray(permissions)
    ? permissions
    : [permissions];

  let hasAccess = false;

  if (permissionsArray.length === 1) {
    hasAccess = hasPermission(permissionsArray[0]);
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissionsArray);
  } else {
    hasAccess = hasAnyPermission(permissionsArray);
  }

  if (!hasAccess) {
    return <>{fallback ?? <AccessDenied />}</>;
  }

  return <>{children}</>;
}