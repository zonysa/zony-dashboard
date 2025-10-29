# RBAC Implementation - Complete Overview

## 📋 Table of Contents

1. [What Was Implemented](#what-was-implemented)
2. [What You Need From Backend](#what-you-need-from-backend)
3. [How To Use It](#how-to-use-it)
4. [Testing](#testing)
5. [Documentation](#documentation)

---

## 🎯 What Was Implemented

### Core System
- ✅ **Zustand Store** for authentication state management
- ✅ **6 User Roles** with specific permissions
- ✅ **40+ Permissions** covering all dashboard features
- ✅ **Type-safe** TypeScript implementation

### Components
- ✅ `<ProtectedRoute>` - Route protection
- ✅ `<RoleGuard>` - Role-based access
- ✅ `<PermissionGuard>` - Permission-based access
- ✅ `<Can>` - Declarative permission checks

### Hooks
- ✅ `usePermissions()` - Complete permission checking
- ✅ `useAuthStore()` - Direct auth state access
- ✅ Selector hooks: `useUser()`, `useIsAuthenticated()`, `useUserRole()`

### Features
- ✅ **Next.js Middleware** - Automatic route protection
- ✅ **Sidebar Filtering** - Shows only permitted menu items
- ✅ **Persistent State** - Survives page refresh
- ✅ **Demo Page** at `/rbac-demo`

---

## 🔗 What You Need From Backend

### Critical Requirement

Your backend's login endpoint MUST return `role_id` in the user object:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role_id": 4,  // ⚠️ REQUIRED: Must be 2-7
    "role": {      // ✨ Optional but nice to have
      "id": 4,
      "name": "Supervisor"
    }
  }
}
```

### Role IDs

| ID | Role | Permissions |
|----|------|-------------|
| 2 | Representative | Partners, Clients, Reports (view/create) |
| 3 | Responsible | Partners, PUDO Points, Parcels (view/edit) |
| 4 | Supervisor | **Full Access** to everything |
| 5 | Customer Service | Parcels, Tickets (view/manage) |
| 6 | Courier | Parcels, Deliveries (view/update status) |
| 7 | Customer | Own Parcels, Tickets (create/view) |

---

## 🚀 How To Use It

### 1. Protect a Page

```typescript
import { ProtectedRoute } from "@/components/auth";

export default function MyPage() {
  return (
    <ProtectedRoute>
      <div>Protected content</div>
    </ProtectedRoute>
  );
}
```

### 2. Check Permissions

```typescript
import { Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";

function MyComponent() {
  return (
    <>
      <Can do={Permission.CREATE_PARCELS}>
        <button>Create Parcel</button>
      </Can>

      <Can do={Permission.EDIT_PARTNERS}>
        <button>Edit Partner</button>
      </Can>
    </>
  );
}
```

### 3. Use Hooks

```typescript
import { usePermissions } from "@/lib/hooks/usePermissions";

function MyComponent() {
  const { hasPermission, roleId, isSupervisor } = usePermissions();

  if (isSupervisor()) {
    return <AdminPanel />;
  }

  if (hasPermission(Permission.VIEW_REPORTS)) {
    return <Reports />;
  }

  return <NoAccess />;
}
```

### 4. Restrict by Role

```typescript
import { RoleGuard } from "@/components/auth";
import { UserRole } from "@/lib/rbac/roles";

function MyPage() {
  return (
    <RoleGuard allowedRoles={[UserRole.SUPERVISOR, UserRole.RESPONSIBLE]}>
      <AdminContent />
    </RoleGuard>
  );
}
```

---

## 🧪 Testing

### Quick Test

1. **Login** at `/auth/login`
2. **Check console** for `role_id` in response
3. **Visit** `/rbac-demo` to see all features
4. **Check sidebar** - should filter based on your role

### Verify Backend Integration

Open browser console and run:

```javascript
JSON.parse(localStorage.getItem('auth-store'))?.state?.user?.role_id
```

**Expected**: A number between 2-7

**If undefined**: Your backend needs to add `role_id` field

### Full Test Guide

See [TEST_RBAC.md](TEST_RBAC.md) for comprehensive testing steps.

---

## 📚 Documentation

### Main Guides
- **[RBAC_GUIDE.md](RBAC_GUIDE.md)** - Complete implementation guide with examples
- **[RBAC_QUICK_REFERENCE.md](RBAC_QUICK_REFERENCE.md)** - Quick reference for common patterns
- **[BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md)** - Backend requirements explained
- **[TEST_RBAC.md](TEST_RBAC.md)** - Step-by-step testing guide

### Implementation Details
- **[RBAC_IMPLEMENTATION_SUMMARY.md](RBAC_IMPLEMENTATION_SUMMARY.md)** - Technical summary of what was built

---

## 🎨 Live Demo

Visit `/rbac-demo` after logging in to see:
- Your current user info
- Your role and permissions
- Live examples of all components
- Interactive permission checks
- Code samples

---

## ⚙️ Configuration

### Environment Variables

Make sure you have:

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://your-backend-server/api
```

### Customizing Permissions

Edit `src/lib/rbac/permissions.ts`:

```typescript
// Add new permission
export enum Permission {
  // ... existing
  MY_NEW_PERMISSION = "action:resource",
}

// Assign to roles
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPERVISOR]: [
    // ... existing
    Permission.MY_NEW_PERMISSION,
  ],
};
```

### Adding New Roles

Edit `src/lib/rbac/roles.ts`:

```typescript
export enum UserRole {
  // ... existing
  NEW_ROLE = 8,
}

export const ROLE_NAMES: Record<UserRole, string> = {
  // ... existing
  [UserRole.NEW_ROLE]: "New Role Name",
};
```

---

## 🐛 Troubleshooting

### "role_id is undefined"
**Solution**: Your backend is not returning `role_id`. See [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md).

### "Sidebar is empty"
**Solution**: Either not logged in, or `role_id` is invalid (must be 2-7).

### "Permissions not working"
**Solution**:
1. Check `role_id` exists in localStorage
2. Verify `role_id` is a number (not string)
3. Ensure `role_id` is between 2-7

### "Can't access protected routes"
**Solution**:
1. Check if `authToken` exists in localStorage
2. Verify middleware is running (check `src/middleware.ts`)
3. Make sure route is in `(protected)` folder

---

## 📁 File Structure

```
src/
├── lib/
│   ├── rbac/
│   │   ├── roles.ts           # Role definitions
│   │   ├── permissions.ts     # Permission system
│   │   └── index.ts
│   ├── stores/
│   │   └── auth-store.ts      # Zustand auth store
│   ├── hooks/
│   │   ├── useAuth.ts         # Auth mutations (modified)
│   │   └── usePermissions.ts  # Permission checks
│   └── schema/
│       └── auth.schema.ts     # User type (modified)
├── components/
│   ├── auth/
│   │   ├── ProtectedRoute.tsx
│   │   ├── RoleGuard.tsx
│   │   ├── PermissionGuard.tsx
│   │   ├── Can.tsx
│   │   └── index.ts
│   ├── providers/
│   │   └── AuthInitializer.tsx
│   └── app-sidebar.tsx        # Modified for filtering
├── middleware.ts              # Route protection
└── app/
    └── (protected)/
        └── rbac-demo/
            └── page.tsx       # Demo page
```

---

## 🎓 Learning Path

1. **Start with** [RBAC_QUICK_REFERENCE.md](RBAC_QUICK_REFERENCE.md) - Get familiar with common patterns
2. **Read** [RBAC_GUIDE.md](RBAC_GUIDE.md) - Understand the full system
3. **Visit** `/rbac-demo` - See live examples
4. **Test** with [TEST_RBAC.md](TEST_RBAC.md) - Verify everything works
5. **Integrate** into your pages - Apply what you learned

---

## ✅ Summary

### What Works Now:
- ✅ Login updates auth store automatically
- ✅ Sidebar filters based on permissions
- ✅ Protected routes redirect to login
- ✅ Permission components show/hide UI
- ✅ State persists across refreshes
- ✅ Type-safe throughout

### What You Need to Do:
1. ⚠️ Ensure your backend returns `role_id` (see [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md))
2. 🧪 Test with [TEST_RBAC.md](TEST_RBAC.md)
3. 🎨 Visit `/rbac-demo` to explore features
4. 🚀 Apply to your pages using `<Can>` and `<ProtectedRoute>`

---

## 🤝 Support

**Issues?** Check these docs in order:
1. [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - Backend not returning `role_id`?
2. [TEST_RBAC.md](TEST_RBAC.md) - Follow the testing steps
3. [RBAC_GUIDE.md](RBAC_GUIDE.md) - Detailed implementation guide
4. [RBAC_QUICK_REFERENCE.md](RBAC_QUICK_REFERENCE.md) - Common usage patterns

**Everything is client-side!** I didn't touch your backend API. The RBAC system only needs your backend to include `role_id` in the login response.

---

**Made with ❤️ using Zustand for state management**
