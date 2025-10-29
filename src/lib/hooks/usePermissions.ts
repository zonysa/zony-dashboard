import { useAuthStore } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";
import { UserRole } from "../rbac/roles";

/**
 * Hook for checking user permissions
 * Provides convenient methods for permission-based access control
 */
export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
  const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);
  const getRoleName = useAuthStore((state) => state.getRoleName);
  const getPermissions = useAuthStore((state) => state.getPermissions);

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  /**
   * Check if user has any of the given roles
   */
  const hasAnyRole = (roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role as UserRole) : false;
  };

  /**
   * Check if user is a supervisor (full access)
   */
  const isSupervisor = (): boolean => {
    return hasRole("supervisor");
  };

  /**
   * Check if user can perform CRUD operations on a resource
   */
  const canCreate = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  const canView = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  const canEdit = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  const canDelete = (permission: Permission): boolean => {
    return hasPermission(permission);
  };

  return {
    // User info
    user,
    roleName: getRoleName(),

    // Permission checks
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getPermissions,

    // Role checks
    hasRole,
    hasAnyRole,
    isSupervisor,

    // CRUD helpers
    canCreate,
    canView,
    canEdit,
    canDelete,
  };
}
