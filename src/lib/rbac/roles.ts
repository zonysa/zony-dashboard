/**
 * User Roles - Using strings from API response
 * The API returns role as a string (e.g., "admin", "customer", "courier")
 */

export type UserRole =
  | "admin"
  | "supervisor"
  | "representative"
  | "responsible"
  | "warehouse_clerk"
  | "customer_service"
  | "courier"
  | "customer";

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  representative: "Representative",
  responsible: "Responsible",
  warehouse_clerk: "Warehouse Clerk",
  customer_service: "Customer Service",
  courier: "Courier",
  customer: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access and administration",
  supervisor: "Operations supervisors and managers",
  representative: "Sales and partnership representatives",
  // A PARTNER's person: runs one PUDO for one partner. Not Zony staff, and
  // deliberately holds no warehouse access.
  responsible: "Partner staff running a PUDO point",
  // Zony's own floor staff, pinned to exactly one warehouse.
  warehouse_clerk: "Zony warehouse staff, assigned to one building",
  customer_service: "Customer support and service team",
  courier: "Delivery personnel and couriers",
  customer: "End customers and clients",
};

// Helper function to normalize role string (handle variations)
export function normalizeRole(role: string): UserRole {
  const normalized = role.toLowerCase().trim().replace(/\s+/g, "_");

  // Map variations to standard roles
  const roleMap: Record<string, UserRole> = {
    admin: "admin",
    administrator: "admin",
    supervisor: "supervisor",
    representative: "representative",
    rep: "representative",
    responsible: "responsible",
    warehouse_clerk: "warehouse_clerk",
    "warehouse clerk": "warehouse_clerk",
    warehouseclerk: "warehouse_clerk",
    customer_service: "customer_service",
    "customer service": "customer_service",
    customerservice: "customer_service",
    courier: "courier",
    driver: "courier",
    customer: "customer",
    client: "customer",
  };

  // Falling through here is silent and looks like a permissions bug rather
  // than a missing map entry: a role the API knows about but this map does not
  // logs in as a customer with none of its screens. Any new backend role must
  // be added above.
  return roleMap[normalized] || "customer"; // Default to most restrictive
}

// Helper function to get role display name
export function getRoleName(role: string): string {
  const normalized = normalizeRole(role);
  return ROLE_DISPLAY_NAMES[normalized] || "Unknown Role";
}

// Helper function to check if role is valid
export function isValidRole(role: string): role is UserRole {
  const normalized = normalizeRole(role);
  return normalized in ROLE_DISPLAY_NAMES;
}
