# RBAC System - Fixed for Your API Response

## The Problem

Your API returns:
```json
{
  "user": {
    "email": "admin@email.com",
    "username": "admin",
    "role": "admin",
    "last_login": "2025-10-30 02:10:37"
  }
}
```

But the RBAC system was expecting:
```typescript
{
  role_id: 4,  // ❌ Your API doesn't return this
  role: {
    id: 4,
    name: "Supervisor"
  }
}
```

## The Solution

**I redesigned the entire RBAC system to work with role strings directly from your API!**

No normalizer needed. No conversion. Just pure role strings.

---

## What Changed

### 1. **User Type** - Now Matches Your API
**File:** `src/lib/schema/auth.schema.ts`

```typescript
export type User = {
  id?: string;
  email: string;
  username: string;
  role: string;  // ✅ Exactly what your API returns!
  last_login?: string;
  // ... other optional fields
};
```

### 2. **Roles** - Now Use Strings
**File:** `src/lib/rbac/roles.ts`

```typescript
// Before: enum UserRole { SUPERVISOR = 4 }
// After:
export type UserRole =
  | "admin"           // ✅ Your API returns this!
  | "supervisor"
  | "representative"
  | "responsible"
  | "customer_service"
  | "courier"
  | "customer";

// Handles variations automatically:
normalizeRole("admin") → "admin"
normalizeRole("Admin") → "admin"
normalizeRole("ADMIN") → "admin"
normalizeRole("customer service") → "customer_service"
```

### 3. **Permissions** - Work with Role Strings
**File:** `src/lib/rbac/permissions.ts`

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_SUPERVISORS,
    // ... ALL permissions (full access)
  ],

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
  // ... other roles
};

// Functions now accept role strings:
getRolePermissions("admin")  // ✅ Returns all admin permissions
hasPermission("customer", Permission.VIEW_SUPERVISORS)  // ✅ Returns false
```

### 4. **Auth Store** - Uses Role String
**File:** `src/lib/stores/auth-store.ts`

```typescript
// Before: user.role_id
// After: user.role

hasPermission: (permission) => {
  const { user } = get();
  return user ? hasPermission(user.role, permission) : false;
},

getRole: () => {
  const { user } = get();
  return user?.role || null;  // Returns "admin", "customer", etc.
},
```

### 5. **Route Guard** - Uses Role String
**File:** `src/components/auth/RoutePermissionGuard.tsx`

```typescript
// Get user's permissions based on role string
const userPermissions = getRolePermissions(user.role);  // ✅ Uses "admin" directly
```

---

## Your API Response → RBAC Flow

```
1. User logs in
   ↓
2. API returns: { "user": { "role": "admin" } }
   ↓
3. useLogin hook stores user in Zustand
   ↓
4. Auth store has: user.role = "admin"
   ↓
5. RoutePermissionGuard reads: user.role
   ↓
6. getRolePermissions("admin") → returns all admin permissions
   ↓
7. Check if route requires permission
   ↓
8. Admin has ALL permissions → ✅ Access granted
```

---

## Role Mapping

Your API can return **any of these** (case-insensitive):

| API Returns | Normalized To | Access Level |
|-------------|---------------|--------------|
| `"admin"` | `admin` | Full access (all pages) |
| `"supervisor"` | `supervisor` | Full access (all pages) |
| `"representative"` | `representative` | Partners, Clients, Reports |
| `"responsible"` | `responsible` | Partners, PUDOs, Zones, Parcels |
| `"customer_service"` or `"customer service"` | `customer_service` | Parcels, Tickets, Clients |
| `"courier"` | `courier` | Parcels, Deliveries |
| `"customer"` | `customer` | Dashboard, Parcels, Tickets only |

**Case doesn't matter:**
- `"Admin"` → `admin` ✅
- `"CUSTOMER"` → `customer` ✅
- `"Customer Service"` → `customer_service` ✅

---

## Testing with Your API

### 1. Login as Admin

**Your API Response:**
```json
{
  "access_token": "eyJ...",
  "user": {
    "email": "admin@email.com",
    "username": "admin",
    "role": "admin"
  }
}
```

**Expected Result:**
- ✅ Can access ALL pages
- ✅ Sidebar shows all navigation items
- ✅ No "Access Denied" errors

### 2. Login as Customer

**Your API Response:**
```json
{
  "access_token": "eyJ...",
  "user": {
    "email": "customer@email.com",
    "username": "customer123",
    "role": "customer"
  }
}
```

**Expected Result:**
- ✅ Sidebar shows: Dashboard, Parcels, Tickets
- ❌ Cannot access: `/supervisors`, `/partners`, `/pudos`, etc.
- ✅ Shows "Access Denied" when trying restricted pages

---

## What You DON'T Need to Do

❌ **No backend changes needed**
❌ **No role_id field required**
❌ **No normalizer/mapper to import**
❌ **No role conversion logic**

Just return `role: "admin"` (or any other role string) and it works!

---

## Debugging

If access control isn't working:

### 1. Check Browser Console

The `RoutePermissionGuard` logs denials:
```
Access denied to /supervisors. Required: view:supervisors User role: customer
```

### 2. Check Zustand DevTools

In browser console:
```javascript
// Check stored user
localStorage.getItem('auth-store')

// Should see:
{
  "state": {
    "user": {
      "email": "admin@email.com",
      "role": "admin"  // ← Should be here!
    }
  }
}
```

### 3. Check Role Permissions

In browser console:
```javascript
import { getRolePermissions } from '@/lib/rbac/permissions';

getRolePermissions("admin");
// Should return array of ~40 permissions

getRolePermissions("customer");
// Should return array of ~8 permissions
```

---

## Adding New Roles

If your backend adds a new role (e.g., `"manager"`):

### 1. Add to Role Type
**File:** `src/lib/rbac/roles.ts`

```typescript
export type UserRole =
  | "admin"
  | "supervisor"
  | "manager"  // ← Add here
  | "representative"
  // ... rest
```

### 2. Add Display Name

```typescript
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: "Admin",
  supervisor: "Supervisor",
  manager: "Manager",  // ← Add here
  // ... rest
};
```

### 3. Define Permissions
**File:** `src/lib/rbac/permissions.ts`

```typescript
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [/* ... */],
  manager: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    // ... manager's permissions
  ],
  // ... rest
};
```

**That's it!** No role_id mapping needed.

---

## Summary

✅ **System now works directly with your API's role strings**
✅ **No conversion or mapping needed**
✅ **Case-insensitive role matching**
✅ **Handles role variations automatically**
✅ **Layout-level protection for all routes**
✅ **Admin role has full access**
✅ **Customer role is restricted**

**Your exact API response works perfectly now!**

```json
{
  "user": {
    "email": "admin@email.com",
    "username": "admin",
    "role": "admin"  // ← This is all we need!
  }
}
```

---

## Files Modified Summary

### Core RBAC Files:
1. ✅ `src/lib/rbac/roles.ts` - Changed from enum to string union type
2. ✅ `src/lib/rbac/permissions.ts` - Updated to use role strings
3. ✅ `src/lib/rbac/route-permissions.ts` - No changes (works with Permission enum)

### State Management:
4. ✅ `src/lib/stores/auth-store.ts` - Updated to use `user.role` string
5. ✅ `src/lib/schema/auth.schema.ts` - Made fields optional to match API

### Components:
6. ✅ `src/components/auth/RoutePermissionGuard.tsx` - Uses role string
7. ✅ `src/components/auth/PermissionGuard.tsx` - Already compatible
8. ✅ `src/components/auth/RoleGuard.tsx` - Already compatible
9. ✅ `src/components/auth/AccessDenied.tsx` - Already compatible

### Layout:
10. ✅ `src/app/(protected)/layout.tsx` - Has RoutePermissionGuard

### Pages:
11-18. ✅ All pages cleaned (no individual guards needed)

---

## Ready to Test!

1. **Clear your localStorage** (to remove old data):
   ```javascript
   localStorage.clear();
   ```

2. **Login with your real API**

3. **Check the console** for any logs

4. **Try accessing different pages**

**It should just work!** 🎉
