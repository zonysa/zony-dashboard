"use client";

import { ReactNode } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/lib/rbac/roles";
import { AccessDenied } from "./AccessDenied";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  fallback,
}: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <>{fallback ?? <AccessDenied />}</>;
  }

  const hasAccess = allowedRoles.includes(user.role as UserRole);

  if (!hasAccess) {
    return <>{fallback ?? <AccessDenied />}</>;
  }

  return <>{children}</>;
}
