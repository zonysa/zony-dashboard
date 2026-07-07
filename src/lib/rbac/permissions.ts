import { UserRole } from "./roles";

// Define all available permissions in the system
export enum Permission {
  // Dashboard
  VIEW_DASHBOARD = "view:dashboard",

  // Supervisors
  VIEW_SUPERVISORS = "view:supervisors",
  CREATE_SUPERVISORS = "create:supervisors",
  EDIT_SUPERVISORS = "edit:supervisors",
  DELETE_SUPERVISORS = "delete:supervisors",

  // Partners
  VIEW_PARTNERS = "view:partners",
  CREATE_PARTNERS = "create:partners",
  EDIT_PARTNERS = "edit:partners",
  DELETE_PARTNERS = "delete:partners",

  // PUDO Points (Branches)
  VIEW_PUDOS = "view:pudos",
  CREATE_PUDOS = "create:pudos",
  EDIT_PUDOS = "edit:pudos",
  DELETE_PUDOS = "delete:pudos",

  // Zones
  VIEW_ZONES = "view:zones",
  CREATE_ZONES = "create:zones",
  EDIT_ZONES = "edit:zones",
  DELETE_ZONES = "delete:zones",

  // Reports & Analytics
  VIEW_REPORTS = "view:reports",
  EXPORT_REPORTS = "export:reports",

  // Parcels
  VIEW_PARCELS = "view:parcels",
  CREATE_PARCELS = "create:parcels",
  EDIT_PARCELS = "edit:parcels",
  DELETE_PARCELS = "delete:parcels",
  TRACK_PARCELS = "track:parcels",
  ASSIGN_PARCELS = "assign:parcels",

  // Clients
  VIEW_CLIENTS = "view:clients",
  CREATE_CLIENTS = "create:clients",
  EDIT_CLIENTS = "edit:clients",
  DELETE_CLIENTS = "delete:clients",

  // Tickets
  VIEW_TICKETS = "view:tickets",
  CREATE_TICKETS = "create:tickets",
  EDIT_TICKETS = "edit:tickets",
  DELETE_TICKETS = "delete:tickets",
  ASSIGN_TICKETS = "assign:tickets",

  // Customer Service
  VIEW_CUSTOMER_SERVICE = "view:customer_service",
  MANAGE_CUSTOMER_SERVICE = "manage:customer_service",

  // Courier
  VIEW_COURIER = "view:courier",
  MANAGE_COURIER = "manage:courier",
  VIEW_DELIVERIES = "view:deliveries",
  UPDATE_DELIVERY_STATUS = "update:delivery_status",

  // Profile
  VIEW_PROFILE = "view:profile",
  EDIT_PROFILE = "edit:profile",
}

// Define permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Admin - Full access (same as supervisor)
  admin: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SUPERVISORS,
    Permission.CREATE_SUPERVISORS,
    Permission.EDIT_SUPERVISORS,
    Permission.DELETE_SUPERVISORS,
    Permission.VIEW_PARTNERS,
    Permission.CREATE_PARTNERS,
    Permission.EDIT_PARTNERS,
    Permission.DELETE_PARTNERS,
    Permission.VIEW_PUDOS,
    Permission.CREATE_PUDOS,
    Permission.EDIT_PUDOS,
    Permission.DELETE_PUDOS,
    Permission.VIEW_ZONES,
    Permission.CREATE_ZONES,
    Permission.EDIT_ZONES,
    Permission.DELETE_ZONES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_PARCELS,
    Permission.CREATE_PARCELS,
    Permission.EDIT_PARCELS,
    Permission.DELETE_PARCELS,
    Permission.TRACK_PARCELS,
    Permission.ASSIGN_PARCELS,
    Permission.VIEW_CLIENTS,
    Permission.CREATE_CLIENTS,
    Permission.EDIT_CLIENTS,
    Permission.DELETE_CLIENTS,
    Permission.VIEW_TICKETS,
    Permission.CREATE_TICKETS,
    Permission.EDIT_TICKETS,
    Permission.DELETE_TICKETS,
    Permission.ASSIGN_TICKETS,
    Permission.VIEW_CUSTOMER_SERVICE,
    Permission.MANAGE_CUSTOMER_SERVICE,
    Permission.VIEW_COURIER,
    Permission.MANAGE_COURIER,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Representative - Sales and partnerships
  representative: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PUDOS,
    Permission.VIEW_PARCELS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Responsible - Account managers
  responsible: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PUDOS,
    Permission.EDIT_PUDOS,
    Permission.VIEW_PARCELS,
    Permission.TRACK_PARCELS,
    Permission.VIEW_REPORTS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Supervisor - Operations management (Full access)
  supervisor: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PARTNERS,
    Permission.VIEW_PUDOS,
    Permission.VIEW_ZONES,
    Permission.VIEW_REPORTS,
    Permission.EXPORT_REPORTS,
    Permission.VIEW_PARCELS,
    Permission.CREATE_PARCELS,
    Permission.EDIT_PARCELS,
    Permission.DELETE_PARCELS,
    Permission.TRACK_PARCELS,
    Permission.ASSIGN_PARCELS,
    Permission.VIEW_CLIENTS,
    Permission.VIEW_TICKETS,
    Permission.CREATE_TICKETS,
    Permission.EDIT_TICKETS,
    Permission.ASSIGN_TICKETS,
    Permission.VIEW_CUSTOMER_SERVICE,
    Permission.MANAGE_CUSTOMER_SERVICE,
    Permission.VIEW_COURIER,
    Permission.MANAGE_COURIER,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Customer Service - Support team
  customer_service: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PARCELS,
    Permission.VIEW_PUDOS,
    Permission.TRACK_PARCELS,
    // Permission.VIEW_CUSTOMER,
    Permission.VIEW_TICKETS,
    Permission.CREATE_TICKETS,
    Permission.EDIT_TICKETS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Courier - Delivery personnel
  courier: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PARCELS,
    Permission.TRACK_PARCELS,
    Permission.VIEW_DELIVERIES,
    Permission.UPDATE_DELIVERY_STATUS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],

  // Customer - End users
  customer: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_PARCELS,
    Permission.CREATE_PARCELS,
    Permission.TRACK_PARCELS,
    Permission.VIEW_TICKETS,
    Permission.CREATE_TICKETS,
    Permission.VIEW_PROFILE,
    Permission.EDIT_PROFILE,
  ],
};

// Helper function to get all permissions for a role
export function getRolePermissions(role: string): Permission[] {
  const normalizedRole = role.toLowerCase().trim().replace(/\s+/g, "_");
  return (
    ROLE_PERMISSIONS[normalizedRole as UserRole] || ROLE_PERMISSIONS.customer
  );
}

// Helper function to check if a role has a specific permission
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

// Helper function to check if a role has any of the given permissions
export function hasAnyPermission(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

// Helper function to check if a role has all of the given permissions
export function hasAllPermissions(
  role: string,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}
