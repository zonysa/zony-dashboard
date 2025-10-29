import { Permission } from "./permissions";

/**
 * Route-to-Permission Mapping
 *
 * This configuration maps route paths to their required permissions.
 * The RoutePermissionGuard component uses this to automatically protect routes.
 *
 * Pattern matching:
 * - Exact match: "/supervisors" matches only /supervisors
 * - Prefix match: "/supervisors/*" matches /supervisors/anything
 * - Dynamic routes: "/partners/[id]" matches /partners/123
 */

export interface RoutePermissionConfig {
  path: string;
  permission: Permission | Permission[];
  requireAll?: boolean; // If multiple permissions, require all (AND) or any (OR)
}

export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  // Supervisors
  {
    path: "/supervisors",
    permission: Permission.VIEW_SUPERVISORS,
  },
  {
    path: "/supervisors/create",
    permission: Permission.CREATE_SUPERVISORS,
  },

  // Partners
  {
    path: "/partners",
    permission: Permission.VIEW_PARTNERS,
  },
  {
    path: "/partners/create",
    permission: Permission.CREATE_PARTNERS,
  },
  {
    path: "/partners/[id]",
    permission: Permission.VIEW_PARTNERS,
  },

  // PUDO Points
  {
    path: "/pudos",
    permission: Permission.VIEW_PUDOS,
  },
  {
    path: "/pudos/create",
    permission: Permission.CREATE_PUDOS,
  },
  {
    path: "/pudos/[id]",
    permission: Permission.VIEW_PUDOS,
  },

  // Zones
  {
    path: "/zones",
    permission: Permission.VIEW_ZONES,
  },
  {
    path: "/zones/[id]",
    permission: Permission.VIEW_ZONES,
  },

  // Reports & Analytics
  {
    path: "/reports-analytics",
    permission: Permission.VIEW_REPORTS,
  },

  // Clients
  {
    path: "/clients",
    permission: Permission.VIEW_CLIENTS,
  },

  // Tickets
  {
    path: "/tickets",
    permission: Permission.VIEW_TICKETS,
  },

  // Customer Service
  {
    path: "/customer-service",
    permission: Permission.VIEW_CUSTOMER_SERVICE,
  },
  {
    path: "/customer-service/create",
    permission: Permission.MANAGE_CUSTOMER_SERVICE,
  },

  // Courier
  {
    path: "/courier",
    permission: Permission.VIEW_COURIER,
  },
  {
    path: "/courier/create",
    permission: Permission.MANAGE_COURIER,
  },

  // Parcels - Most roles can view
  {
    path: "/parcels",
    permission: Permission.VIEW_PARCELS,
  },
  {
    path: "/parcels/[id]",
    permission: Permission.VIEW_PARCELS,
  },
];

/**
 * Check if a route path matches a pattern
 */
export function matchRoute(pattern: string, path: string): boolean {
  // Remove trailing slashes for consistent matching
  const cleanPattern = pattern.replace(/\/$/, "");
  const cleanPath = path.replace(/\/$/, "");

  // Exact match
  if (cleanPattern === cleanPath) {
    return true;
  }

  // Convert Next.js dynamic route syntax [id] to regex pattern
  const regexPattern = cleanPattern
    .replace(/\[.*?\]/g, "[^/]+") // Replace [id] with regex for any non-slash chars
    .replace(/\*/g, ".*"); // Replace * with regex for any chars

  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(cleanPath);
}

/**
 * Get required permissions for a route path
 */
export function getRoutePermissions(
  path: string
): RoutePermissionConfig | null {
  // Find the first matching route configuration
  return (
    ROUTE_PERMISSIONS.find((config) => matchRoute(config.path, path)) || null
  );
}

/**
 * Check if a user has permission to access a route
 */
export function canAccessRoute(
  path: string,
  userPermissions: Permission[]
): boolean {
  const routeConfig = getRoutePermissions(path);

  // If no permission required, allow access
  if (!routeConfig) {
    return true;
  }

  const requiredPermissions = Array.isArray(routeConfig.permission)
    ? routeConfig.permission
    : [routeConfig.permission];

  if (routeConfig.requireAll) {
    // Require ALL permissions (AND)
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  } else {
    // Require ANY permission (OR)
    return requiredPermissions.some((perm) => userPermissions.includes(perm));
  }
}
