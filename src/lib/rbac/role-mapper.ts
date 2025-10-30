import { UserRole, normalizeRole } from "./roles";

/**
 * Role String to Role Mapping
 *
 * Maps the role strings returned by the API to standardized UserRole strings.
 */

export const ROLE_STRING_TO_ROLE: Record<string, UserRole> = {
  admin: "admin",
  supervisor: "supervisor",
  representative: "representative",
  responsible: "responsible",
  "customer service": "customer_service",
  "customer_service": "customer_service",
  customerservice: "customer_service",
  courier: "courier",
  customer: "customer",
};

export const ROLE_TO_STRING: Record<UserRole, string> = {
  admin: "admin",
  supervisor: "supervisor",
  representative: "representative",
  responsible: "responsible",
  customer_service: "customer_service",
  courier: "courier",
  customer: "customer",
};

/**
 * Convert role string from API to standardized UserRole
 */
export function roleStringToRole(roleString: string): UserRole {
  return normalizeRole(roleString);
}

/**
 * Convert UserRole to role string
 */
export function roleToString(role: UserRole): string {
  return ROLE_TO_STRING[role] || "customer";
}

/**
 * Normalize a user object to ensure it has role
 */
export function normalizeUser<T extends { role?: string }>(
  user: T
): T & { role: UserRole } {
  // If role exists, normalize it
  if (user.role) {
    return {
      ...user,
      role: normalizeRole(user.role),
    };
  }

  // No role - default to customer (most restrictive)
  console.warn("User has no role. Defaulting to Customer.");
  return {
    ...user,
    role: "customer",
  };
}
