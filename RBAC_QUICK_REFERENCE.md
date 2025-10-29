# RBAC Quick Reference

## Import Statements

```typescript
// Auth store
import { useAuthStore, useUser, useIsAuthenticated, useUserRole } from "@/lib/stores/auth-store";

// Components
import { ProtectedRoute, RoleGuard, PermissionGuard, Can } from "@/components/auth";

// Types
import { Permission } from "@/lib/rbac/permissions";
import { UserRole } from "@/lib/rbac/roles";

// Hook
import { usePermissions } from "@/lib/hooks/usePermissions";
```

## Common Patterns

### 1. Get Current User

```typescript
const user = useUser();
const isAuthenticated = useIsAuthenticated();
const { roleId, roleName } = useUserRole();
```

### 2. Check Permissions

```typescript
const { hasPermission, canView, canEdit } = usePermissions();

if (hasPermission(Permission.VIEW_PARCELS)) { /* ... */ }
if (canEdit(Permission.EDIT_PARCELS)) { /* ... */ }
```

### 3. Protect a Route

```typescript
<ProtectedRoute>
  <YourPageContent />
</ProtectedRoute>
```

### 4. Restrict by Role

```typescript
<RoleGuard allowedRoles={[UserRole.SUPERVISOR, UserRole.RESPONSIBLE]}>
  <AdminPanel />
</RoleGuard>
```

### 5. Show/Hide UI Elements

```typescript
<Can do={Permission.CREATE_PARCELS}>
  <button>Create Parcel</button>
</Can>
```

### 6. Multiple Permissions (OR)

```typescript
<Can do={[Permission.EDIT_PARCELS, Permission.DELETE_PARCELS]}>
  <button>Manage</button>
</Can>
```

### 7. Multiple Permissions (AND)

```typescript
<Can do={[Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS]} requireAll>
  <button>Export</button>
</Can>
```

## Role IDs

| ID | Role Name        |
|----|------------------|
| 2  | Representative   |
| 3  | Responsible      |
| 4  | Supervisor       |
| 5  | Customer Service |
| 6  | Courier          |
| 7  | Customer         |

## Common Permissions

```typescript
Permission.VIEW_DASHBOARD
Permission.VIEW_SUPERVISORS
Permission.VIEW_PARTNERS
Permission.CREATE_PARTNERS
Permission.EDIT_PARTNERS
Permission.VIEW_PUDOS
Permission.VIEW_ZONES
Permission.VIEW_REPORTS
Permission.EXPORT_REPORTS
Permission.VIEW_PARCELS
Permission.CREATE_PARCELS
Permission.EDIT_PARCELS
Permission.TRACK_PARCELS
Permission.ASSIGN_PARCELS
Permission.VIEW_CLIENTS
Permission.VIEW_TICKETS
Permission.CREATE_TICKETS
Permission.VIEW_CUSTOMER_SERVICE
Permission.VIEW_COURIER
Permission.UPDATE_DELIVERY_STATUS
```

## usePermissions Hook

```typescript
const {
  user,              // Current user object
  roleId,            // User's role ID
  roleName,          // User's role name
  hasPermission,     // Check single permission
  hasAnyPermission,  // Check multiple (OR)
  hasAllPermissions, // Check multiple (AND)
  hasRole,           // Check if user has specific role
  hasAnyRole,        // Check if user has any of given roles
  isSupervisor,      // Check if user is supervisor
  canCreate,         // Alias for hasPermission
  canView,           // Alias for hasPermission
  canEdit,           // Alias for hasPermission
  canDelete,         // Alias for hasPermission
} = usePermissions();
```

## Complete Page Example

```typescript
import { ProtectedRoute, Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function ParcelsPage() {
  const { canEdit, canDelete, isSupervisor } = usePermissions();

  return (
    <ProtectedRoute>
      <div>
        <h1>Parcels</h1>

        <Can do={Permission.CREATE_PARCELS}>
          <button>Create New Parcel</button>
        </Can>

        {parcels.map(parcel => (
          <div key={parcel.id}>
            <span>{parcel.name}</span>

            {canEdit(Permission.EDIT_PARCELS) && (
              <button>Edit</button>
            )}

            {canDelete(Permission.DELETE_PARCELS) && (
              <button>Delete</button>
            )}

            {isSupervisor() && (
              <button>Admin Actions</button>
            )}
          </div>
        ))}
      </div>
    </ProtectedRoute>
  );
}
```
