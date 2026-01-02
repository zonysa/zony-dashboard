# RBAC Layout-Level Protection - Final Implementation

## Overview

You were absolutely right! Instead of wrapping each individual page with guards, we've implemented **centralized layout-level protection** that's much cleaner and more maintainable.

## How It Works

### Architecture

```
Layout (Protected)
├── ProtectedRoute (checks authentication)
└── RoutePermissionGuard (checks permissions based on URL)
    └── Page Content (clean, no guards needed!)
```

### Key Components

#### 1. Route Permission Mapping
**File:** `src/lib/rbac/route-permissions.ts`

A centralized configuration that maps routes to their required permissions:

```typescript
export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  { path: "/supervisors", permission: Permission.VIEW_SUPERVISORS },
  { path: "/partners", permission: Permission.VIEW_PARTNERS },
  { path: "/pudos", permission: Permission.VIEW_PUDOS },
  { path: "/zones", permission: Permission.VIEW_ZONES },
  { path: "/reports-analytics", permission: Permission.VIEW_REPORTS },
  { path: "/clients", permission: Permission.VIEW_CLIENTS },
  { path: "/customer-service", permission: Permission.VIEW_CUSTOMER_SERVICE },
  { path: "/courier", permission: Permission.VIEW_COURIER },
  { path: "/parcels", permission: Permission.VIEW_PARCELS },
  // ... more routes
];
```

**Benefits:**
- Single source of truth for route permissions
- Easy to see all protected routes at a glance
- Simple to add/remove/modify permissions
- Supports dynamic routes like `/partners/[id]`

#### 2. RoutePermissionGuard Component
**File:** `src/components/auth/RoutePermissionGuard.tsx`

Automatically checks permissions based on the current pathname:

```typescript
export function RoutePermissionGuard({ children }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  // Get user's permissions
  const userPermissions = getRolePermissions(user.role_id);

  // Check if user can access this route
  const canAccess = canAccessRoute(pathname, userPermissions);

  if (!canAccess) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
```

#### 3. Updated Layout
**File:** `src/app/(protected)/layout.tsx`

Simple, clean layout with two layers of protection:

```typescript
export default function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <RoutePermissionGuard>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Header />
            <div className="w-full mt-16">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </RoutePermissionGuard>
    </ProtectedRoute>
  );
}
```

### Clean Pages

Now your pages are **clean and simple** - no guards needed!

**Before:**
```typescript
export default function Page() {
  return (
    <PermissionGuard permissions={Permission.VIEW_SUPERVISORS}>
      <div>
        {/* content */}
      </div>
    </PermissionGuard>
  );
}
```

**After:**
```typescript
export default function Page() {
  return (
    <div>
      {/* content */}
    </div>
  );
}
```

---

## Advantages Over Individual Page Guards

### ✅ **Centralized Management**
All route permissions in one file instead of scattered across 20+ pages

### ✅ **DRY (Don't Repeat Yourself)**
No need to import and wrap guards in every single page

### ✅ **Automatic Protection**
New pages are automatically protected when added to the config

### ✅ **Easier Testing**
Test route permissions in one place instead of testing each page

### ✅ **Better Performance**
Single permission check at layout level vs multiple checks per page

### ✅ **Cleaner Code**
Pages focus on their content, not authorization logic

### ✅ **Easier Maintenance**
Change permissions in one file, affects all routes instantly

---

## How Permissions Are Checked

### Flow Diagram

```
User navigates to /supervisors
         ↓
Layout renders
         ↓
ProtectedRoute: Is user logged in? ✅
         ↓
RoutePermissionGuard: Check pathname = "/supervisors"
         ↓
Look up required permission: VIEW_SUPERVISORS
         ↓
Check user's role permissions
         ↓
Customer (role_id: 7) → ❌ No VIEW_SUPERVISORS permission
         ↓
Show AccessDenied page
```

### Permission Matching

The system supports:
- **Exact match:** `/supervisors` matches only `/supervisors`
- **Dynamic routes:** `/partners/[id]` matches `/partners/123`, `/partners/abc`
- **Nested routes:** `/supervisors/create` can have different permission than `/supervisors`

---

## Adding New Protected Routes

### 1. Add to Route Permissions Config

Edit `src/lib/rbac/route-permissions.ts`:

```typescript
export const ROUTE_PERMISSIONS: RoutePermissionConfig[] = [
  // ... existing routes
  {
    path: "/new-feature",
    permission: Permission.VIEW_NEW_FEATURE,
  },
  {
    path: "/new-feature/create",
    permission: Permission.CREATE_NEW_FEATURE,
  },
];
```

### 2. Define the Permission (if new)

Edit `src/lib/rbac/permissions.ts`:

```typescript
export enum Permission {
  // ... existing permissions
  VIEW_NEW_FEATURE = "view:new_feature",
  CREATE_NEW_FEATURE = "create:new_feature",
}
```

### 3. Assign to Roles

Edit `src/lib/rbac/permissions.ts`:

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERVISOR]: [
    // ... existing permissions
    Permission.VIEW_NEW_FEATURE,
    Permission.CREATE_NEW_FEATURE,
  ],
  [UserRole.REPRESENTATIVE]: [
    // ... existing permissions
    Permission.VIEW_NEW_FEATURE,
  ],
  // ... other roles
};
```

### 4. Add to Sidebar (if needed)

Edit `src/components/app-sidebar.tsx`:

```typescript
const navItems = [
  // ... existing items
  {
    title: "New Feature",
    url: "/new-feature",
    icon: YourIcon,
    permission: Permission.VIEW_NEW_FEATURE,
  },
];
```

**That's it!** Your new route is now protected. No need to modify the page component itself.

---

## Customer Permissions

Customers (role_id: 7) can only access:
- ✅ Dashboard (/)
- ✅ Parcels (/parcels)
- ✅ Tickets (/tickets)
- ✅ Profile (/profile)

All other routes show "Access Denied":
- ❌ /supervisors
- ❌ /partners
- ❌ /pudos
- ❌ /zones
- ❌ /reports-analytics
- ❌ /clients
- ❌ /customer-service
- ❌ /courier

---

## Testing

### Test as Customer

1. Login with customer credentials
2. Try navigating to `/supervisors` via URL
3. Should see "Access Denied" page
4. Click "Go to Dashboard" - should work
5. Sidebar should only show: Dashboard, Parcels, Tickets

### Test as Other Roles

Same process for other roles - they should only access their permitted routes.

---

## Files Modified

### New Files:
1. `src/lib/rbac/route-permissions.ts` - Route-to-permission mapping
2. `src/components/auth/RoutePermissionGuard.tsx` - Layout-level guard
3. `src/components/auth/AccessDenied.tsx` - Access denied page (created earlier)

### Modified Files:
1. `src/app/(protected)/layout.tsx` - Added RoutePermissionGuard
2. `src/app/(protected)/supervisors/page.tsx` - Removed individual guard
3. `src/app/(protected)/partners/page.tsx` - Removed individual guard
4. `src/app/(protected)/pudos/page.tsx` - Removed individual guard
5. `src/app/(protected)/zones/page.tsx` - Removed individual guard
6. `src/app/(protected)/reports-analytics/page.tsx` - Removed individual guard
7. `src/app/(protected)/clients/page.tsx` - Removed individual guard
8. `src/app/(protected)/customer-service/page.tsx` - Already clean
9. `src/app/(protected)/courier/page.tsx` - Removed individual guard

---

## When to Use Individual Guards

The layout-level approach works for **entire pages**. Use individual guards when you need:

### 1. Component-Level Protection

```typescript
<Can do={Permission.DELETE_PARTNER}>
  <Button onClick={handleDelete}>Delete</Button>
</Can>
```

### 2. Multiple Permissions on Same Page

```typescript
<PermissionGuard permissions={[Permission.VIEW_ADVANCED_REPORTS, Permission.EXPORT_REPORTS]}>
  <AdvancedReportSection />
</PermissionGuard>
```

### 3. Conditional UI Elements

```typescript
const { hasPermission } = usePermissions();

{hasPermission(Permission.EDIT_PARTNER) && (
  <EditButton />
)}
```

---

## Key Takeaway

**Layout-level protection is better for:**
- Protecting entire routes/pages
- Centralized configuration
- Maintainability

**Component-level protection is better for:**
- Conditional UI elements
- Buttons, links, sections within a page
- Fine-grained control

---

## Migration Complete!

Your RBAC system is now:
- ✅ Centralized at layout level
- ✅ Easier to maintain
- ✅ Cleaner page components
- ✅ Single source of truth for route permissions
- ✅ Automatic protection for all routes

**Much better approach than individual page guards!**
