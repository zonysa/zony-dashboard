/**
 * User Roles - Using strings from API response
 * The API returns role as a string (e.g., "admin", "customer", "courier")
 */

export type UserRole =
  | "admin"
  | "supervisor"
  | "representative"
  | "responsible"
  | "customer_service"
  | "courier"
  | "customer";

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  representative: "Representative",
  responsible: "Responsible",
  customer_service: "Customer Service",
  courier: "Courier",
  customer: "Customer",
};

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  admin: "Full system access and administration",
  supervisor: "Operations supervisors and managers",
  representative: "Sales and partnership representatives",
  responsible: "Account managers and responsible parties",
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
    customer_service: "customer_service",
    "customer service": "customer_service",
    customerservice: "customer_service",
    courier: "courier",
    driver: "courier",
    customer: "customer",
    client: "customer",
  };

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
