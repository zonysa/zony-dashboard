# Role-Based Access Control (RBAC) Implementation Guide

This guide explains how to use the role-based access control system in the Zony Dashboard.

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Permissions System](#permissions-system)
4. [Using the Auth Store](#using-the-auth-store)
5. [Protecting Routes](#protecting-routes)
6. [Protecting UI Components](#protecting-ui-components)
7. [Examples](#examples)

---

## Overview

The RBAC system provides fine-grained access control based on user roles and permissions. It includes:

- **6 User Roles**: Representative, Responsible, Supervisor, Customer Service, Courier, Customer
- **Zustand Store**: Centralized authentication state management
- **Permission-based access**: Each role has specific permissions
- **Route Protection**: Middleware and components to protect routes
- **UI Guards**: Components to show/hide UI elements based on permissions

---

## User Roles

The system supports the following roles (defined in [src/lib/rbac/roles.ts](src/lib/rbac/roles.ts)):

| Role ID | Role Name          | Description                          |
|---------|--------------------|--------------------------------------|
| 2       | Representative     | Sales and partnership representatives |
| 3       | Responsible        | Account managers and responsible parties |
| 4       | Supervisor         | Operations supervisors (full access) |
| 5       | Customer Service   | Customer support team                |
| 6       | Courier            | Delivery personnel                   |
| 7       | Customer           | End customers                        |

---

## Permissions System

Permissions are defined in [src/lib/rbac/permissions.ts](src/lib/rbac/permissions.ts). Each role has specific permissions:

### Supervisor (Full Access)
- All CRUD operations on Supervisors, Partners, PUDO Points, Zones
- View and export Reports & Analytics
- Full Parcel management and assignment
- Full Client management
- Ticket management and assignment
- Customer Service and Courier management

### Representative
- View and create Partners
- View PUDO Points and Clients
- Create Clients
- View Reports

### Responsible
- Edit Partners and PUDO Points
- View and edit Parcels
- Track Parcels
- Edit Clients
- View Reports

### Customer Service
- View and track Parcels
- View Clients
- Create and edit Tickets

### Courier
- View and track Parcels
- Update delivery status

### Customer
- Create and track their own Parcels
- Create and view Tickets

---

## Using the Auth Store

The auth store is built with Zustand and provides centralized state management.

### Import the store

```typescript
import { useAuthStore, useUser, useIsAuthenticated, useUserRole } from "@/lib/stores/auth-store";
```

### Access user information

```typescript
// Get the entire user object
const user = useAuthStore((state) => state.user);

// Or use selector hooks for better performance
const user = useUser();
const isAuthenticated = useIsAuthenticated();
const { roleId, roleName } = useUserRole();
```

### Check permissions

```typescript
const hasPermission = useAuthStore((state) => state.hasPermission);
const hasAnyPermission = useAuthStore((state) => state.hasAnyPermission);
const hasAllPermissions = useAuthStore((state) => state.hasAllPermissions);

// Check single permission
if (hasPermission(Permission.VIEW_SUPERVISORS)) {
  // Show supervisors
}

// Check multiple permissions (any)
if (hasAnyPermission([Permission.CREATE_PARCELS, Permission.EDIT_PARCELS])) {
  // User can create OR edit parcels
}

// Check multiple permissions (all required)
if (hasAllPermissions([Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS])) {
  // User can both view AND export reports
}
```

### Actions

```typescript
const setUser = useAuthStore((state) => state.setUser);
const logout = useAuthStore((state) => state.logout);

// Set user (usually done automatically after login)
setUser(userData);

// Logout
logout();
```

---

## Protecting Routes

### 1. Middleware Protection (Automatic)

The middleware in [src/middleware.ts](src/middleware.ts) automatically:
- Redirects unauthenticated users to `/auth/login`
- Redirects authenticated users away from auth pages
- Preserves the original URL for redirect after login

### 2. Component-Level Protection

Wrap your page content with `ProtectedRoute`:

```typescript
// app/(protected)/supervisors/page.tsx
import { ProtectedRoute } from "@/components/auth";

export default function SupervisorsPage() {
  return (
    <ProtectedRoute>
      <div>Supervisors content</div>
    </ProtectedRoute>
  );
}
```

### 3. Role-Based Route Protection

Use `RoleGuard` to restrict access to specific roles:

```typescript
import { RoleGuard } from "@/components/auth";
import { UserRole } from "@/lib/rbac/roles";

export default function SupervisorsPage() {
  return (
    <RoleGuard
      allowedRoles={[UserRole.SUPERVISOR, UserRole.RESPONSIBLE]}
      fallback={<div>Access Denied</div>}
    >
      <div>Supervisors content</div>
    </RoleGuard>
  );
}
```

---

## Protecting UI Components

### 1. Permission-Based Components

Use the `Can` component for clean, declarative permission checks:

```typescript
import { Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";

function ParcelActions() {
  return (
    <div>
      <Can do={Permission.VIEW_PARCELS}>
        <button>View Parcels</button>
      </Can>

      <Can do={Permission.CREATE_PARCELS}>
        <button>Create Parcel</button>
      </Can>

      <Can
        do={[Permission.EDIT_PARCELS, Permission.DELETE_PARCELS]}
        requireAll={false}
      >
        <button>Manage Parcels</button>
      </Can>
    </div>
  );
}
```

### 2. PermissionGuard Component

Use `PermissionGuard` for more complex scenarios:

```typescript
import { PermissionGuard } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";

function ReportsPage() {
  return (
    <PermissionGuard
      permissions={[Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS]}
      requireAll={true}
      fallback={<p>You need view and export permissions</p>}
    >
      <ReportsComponent />
    </PermissionGuard>
  );
}
```

### 3. Conditional Rendering with Hooks

For more control, use the store directly:

```typescript
import { useAuthStore } from "@/lib/stores/auth-store";
import { Permission } from "@/lib/rbac/permissions";

function ParcelList() {
  const hasPermission = useAuthStore((state) => state.hasPermission);
  const canEdit = hasPermission(Permission.EDIT_PARCELS);
  const canDelete = hasPermission(Permission.DELETE_PARCELS);

  return (
    <div>
      {parcels.map((parcel) => (
        <div key={parcel.id}>
          <span>{parcel.name}</span>
          {canEdit && <button>Edit</button>}
          {canDelete && <button>Delete</button>}
        </div>
      ))}
    </div>
  );
}
```

---

## Examples

### Example 1: Protected Page with Role Check

```typescript
// app/(protected)/supervisors/page.tsx
import { ProtectedRoute, RoleGuard } from "@/components/auth";
import { UserRole } from "@/lib/rbac/roles";

export default function SupervisorsPage() {
  return (
    <ProtectedRoute>
      <RoleGuard
        allowedRoles={[UserRole.SUPERVISOR]}
        fallback={
          <div className="p-4">
            <h1>Access Denied</h1>
            <p>You need supervisor privileges to view this page.</p>
          </div>
        }
      >
        <div>
          <h1>Supervisors Management</h1>
          {/* Page content */}
        </div>
      </RoleGuard>
    </ProtectedRoute>
  );
}
```

### Example 2: Conditional Button Rendering

```typescript
import { Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";

function ParcelCard({ parcel }) {
  return (
    <div className="card">
      <h3>{parcel.title}</h3>
      <p>{parcel.description}</p>

      <div className="actions">
        <Can do={Permission.VIEW_PARCELS}>
          <button>View Details</button>
        </Can>

        <Can do={Permission.EDIT_PARCELS}>
          <button>Edit</button>
        </Can>

        <Can do={Permission.DELETE_PARCELS}>
          <button>Delete</button>
        </Can>

        <Can do={Permission.ASSIGN_PARCELS}>
          <button>Assign to Courier</button>
        </Can>
      </div>
    </div>
  );
}
```

### Example 3: Multiple Permission Checks

```typescript
import { Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";

function ReportsSection() {
  return (
    <div>
      <Can do={Permission.VIEW_REPORTS}>
        <div className="reports-viewer">
          <h2>Reports</h2>
          {/* Report content */}
        </div>
      </Can>

      <Can
        do={[Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS]}
        requireAll={true}
      >
        <button>Export to PDF</button>
        <button>Export to Excel</button>
      </Can>
    </div>
  );
}
```

### Example 4: User Profile Display

```typescript
import { useUser, useUserRole } from "@/lib/stores/auth-store";

function UserProfile() {
  const user = useUser();
  const { roleId, roleName } = useUserRole();

  if (!user) return null;

  return (
    <div className="profile">
      <h2>{user.first_name} {user.last_name}</h2>
      <p>Email: {user.email}</p>
      <p>Role: {roleName}</p>
      <p>Role ID: {roleId}</p>
    </div>
  );
}
```

### Example 5: Dynamic Navigation Based on Permissions

The sidebar in [src/components/app-sidebar.tsx](src/components/app-sidebar.tsx) automatically filters navigation items based on user permissions:

```typescript
const hasPermission = useAuthStore((state) => state.hasPermission);

const filteredNavItems = React.useMemo(() => {
  return navItems.filter((item) => hasPermission(item.permission));
}, [hasPermission]);
```

---

## API Integration

When your backend returns the user object after login, make sure it includes the `role_id` field:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role_id": 4,
    "role": {
      "id": 4,
      "name": "Supervisor"
    }
  }
}
```

The login hook will automatically:
1. Store tokens in localStorage
2. Update the Zustand auth store with user data
3. Enable role-based access control throughout the app

---

## Customizing Permissions

To add or modify permissions:

1. Add new permission to the `Permission` enum in [src/lib/rbac/permissions.ts](src/lib/rbac/permissions.ts)
2. Update the `ROLE_PERMISSIONS` object to assign the permission to relevant roles
3. Use the new permission in your components with `Can`, `PermissionGuard`, or `hasPermission`

Example:

```typescript
// In permissions.ts
export enum Permission {
  // ... existing permissions
  MANAGE_INVOICES = "manage:invoices",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERVISOR]: [
    // ... existing permissions
    Permission.MANAGE_INVOICES,
  ],
  // ... other roles
};

// In your component
<Can do={Permission.MANAGE_INVOICES}>
  <button>Manage Invoices</button>
</Can>
```

---

## Troubleshooting

### User is null after refresh

Make sure your backend returns the user object in the login response. The Zustand store persists the user data to localStorage, so it should survive page refreshes.

### Permissions not working

1. Check that your backend returns `role_id` in the user object
2. Verify the role_id matches the roles defined in [src/lib/rbac/roles.ts](src/lib/rbac/roles.ts)
3. Check that the permission is assigned to the role in [src/lib/rbac/permissions.ts](src/lib/rbac/permissions.ts)

### Middleware not redirecting

Make sure [src/middleware.ts](src/middleware.ts) is in the root `src` directory and the token is stored in localStorage as "authToken".

---

## Summary

- Use `useAuthStore` for accessing auth state and checking permissions
- Use `ProtectedRoute` for route-level protection
- Use `RoleGuard` for role-based access control
- Use `Can` or `PermissionGuard` for component-level permission checks
- The sidebar automatically filters based on permissions
- All roles and permissions are centrally defined and easy to customize
