import { UserRole } from "./roles";

/**
 * Role String to Role ID Mapping
 *
 * Maps the role strings returned by the API to role_id numbers used by the RBAC system.
 */

export const ROLE_STRING_TO_ID: Record<string, UserRole> = {
  admin: UserRole.SUPERVISOR, // Admin = Supervisor (full access)
  supervisor: UserRole.SUPERVISOR,
  representative: UserRole.REPRESENTATIVE,
  responsible: UserRole.RESPONSIBLE,
  "customer service": UserRole.CUSTOMER_SERVICE,
  "customer_service": UserRole.CUSTOMER_SERVICE,
  customerservice: UserRole.CUSTOMER_SERVICE,
  courier: UserRole.COURIER,
  customer: UserRole.CUSTOMER,
};

export const ROLE_ID_TO_STRING: Record<UserRole, string> = {
  [UserRole.REPRESENTATIVE]: "representative",
  [UserRole.RESPONSIBLE]: "responsible",
  [UserRole.SUPERVISOR]: "supervisor",
  [UserRole.CUSTOMER_SERVICE]: "customer_service",
  [UserRole.COURIER]: "courier",
  [UserRole.CUSTOMER]: "customer",
};

/**
 * Convert role string from API to role_id number
 */
export function roleStringToId(roleString: string): UserRole {
  const normalized = roleString.toLowerCase().trim();
  const roleId = ROLE_STRING_TO_ID[normalized];

  if (!roleId) {
    console.warn(`Unknown role string: "${roleString}". Defaulting to Customer.`);
    return UserRole.CUSTOMER; // Default to most restrictive role
  }

  return roleId;
}

/**
 * Convert role_id number to role string
 */
export function roleIdToString(roleId: number): string {
  return ROLE_ID_TO_STRING[roleId as UserRole] || "customer";
}

/**
 * Normalize a user object to ensure it has role_id
 */
export function normalizeUser<T extends { role?: string; role_id?: number }>(
  user: T
): T & { role_id: number } {
  // If role_id already exists, return as is
  if (user.role_id !== undefined) {
    return user as T & { role_id: number };
  }

  // If only role string exists, convert it
  if (user.role) {
    return {
      ...user,
      role_id: roleStringToId(user.role),
    };
  }

  // Neither exists - default to customer (most restrictive)
  console.warn("User has neither role nor role_id. Defaulting to Customer.");
  return {
    ...user,
    role_id: UserRole.CUSTOMER,
  };
}
