// Auth Store
export { useAuthStore, useUser, useIsAuthenticated, useUserRole } from "./stores/auth-store";

// RBAC
export {
  UserRole,
  ROLE_NAMES,
  ROLE_DESCRIPTIONS,
  getRoleName,
  isValidRole,
  Permission,
  ROLE_PERMISSIONS,
  getRolePermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./rbac";

// Hooks
export { usePermissions } from "./hooks/usePermissions";

// Components (re-export from auth components)
export { ProtectedRoute, RoleGuard, PermissionGuard, Can } from "@/components/auth";
