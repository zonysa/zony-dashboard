# Testing RBAC Implementation

## Quick Test Checklist

### ✅ Step 1: Check TypeScript Compilation

Run this command to ensure no TypeScript errors:

```bash
npm run build
```

**Expected**: Build completes without errors ✓

---

### ✅ Step 2: Test Login Flow

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Navigate to** `http://localhost:3000/auth/login`

4. **Login** with test credentials:
   - Email: `admin@email.com`
   - Password: `00000000`

5. **Check console** for any errors

6. **Check if redirected** to dashboard (`/`)

---

### ✅ Step 3: Verify Auth Store

Open browser console and run:

```javascript
// Get the auth store from localStorage
JSON.parse(localStorage.getItem('auth-store'))
```

**Expected output**:
```javascript
{
  state: {
    user: {
      id: "...",
      email: "...",
      role_id: 4,  // ← This should exist!
      // ... other user fields
    },
    isAuthenticated: true,
    isInitialized: true
  },
  version: 0
}
```

**If `role_id` is undefined** → Your backend is not returning it!

---

### ✅ Step 4: Test Permission Checking

In browser console, run:

```javascript
// Import the store (copy/paste this whole block)
const checkPermissions = () => {
  const store = JSON.parse(localStorage.getItem('auth-store'));
  const user = store?.state?.user;

  console.log('User:', user);
  console.log('Role ID:', user?.role_id);
  console.log('Role Name:', user?.role?.name);

  if (!user?.role_id) {
    console.error('❌ role_id is missing! Your backend needs to return it.');
  } else {
    console.log('✅ role_id found:', user.role_id);
  }
};

checkPermissions();
```

---

### ✅ Step 5: Visit Demo Page

1. **Navigate to**: `http://localhost:3000/rbac-demo`

2. **Check if you see**:
   - Your user information
   - Your role ID and name
   - List of permissions with ✅ or ❌
   - Various action buttons

3. **Look for any console errors**

**Expected**: Page loads without errors and shows your permissions

---

### ✅ Step 6: Test Sidebar Filtering

1. **Look at the sidebar** on the left

2. **Count the menu items** you can see

3. **Compare with your role**:
   - **Supervisor (role_id: 4)**: Should see ALL menu items
   - **Representative (role_id: 2)**: Should see fewer items
   - **Courier (role_id: 6)**: Should see minimal items

**Expected**: Sidebar shows only items you have permission for

---

### ✅ Step 7: Test Permission Components

Create a test page: `src/app/(protected)/test-permissions/page.tsx`

```typescript
"use client";

import { Can } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";
import { usePermissions } from "@/lib/hooks/usePermissions";

export default function TestPage() {
  const { user, roleId, roleName, hasPermission } = usePermissions();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Permission Test Page</h1>

      <div className="space-y-4">
        <div>
          <p>User: {user?.email}</p>
          <p>Role ID: {roleId}</p>
          <p>Role Name: {roleName}</p>
        </div>

        <div>
          <h2 className="font-bold">Can Component Test:</h2>

          <Can do={Permission.VIEW_SUPERVISORS}>
            <p className="text-green-600">✅ You can view supervisors</p>
          </Can>

          <Can do={Permission.CREATE_PARCELS}>
            <p className="text-green-600">✅ You can create parcels</p>
          </Can>

          <Can do={Permission.DELETE_CLIENTS}>
            <p className="text-green-600">✅ You can delete clients</p>
          </Can>
        </div>

        <div>
          <h2 className="font-bold">Direct Permission Check:</h2>
          <p>View Supervisors: {hasPermission(Permission.VIEW_SUPERVISORS) ? '✅' : '❌'}</p>
          <p>Create Parcels: {hasPermission(Permission.CREATE_PARCELS) ? '✅' : '❌'}</p>
          <p>Delete Clients: {hasPermission(Permission.DELETE_CLIENTS) ? '✅' : '❌'}</p>
        </div>
      </div>
    </div>
  );
}
```

**Navigate to**: `http://localhost:3000/test-permissions`

**Expected**: Shows your permissions correctly

---

### ✅ Step 8: Test Logout

1. **Click logout** in the sidebar

2. **Check if**:
   - Redirected to `/auth/login`
   - localStorage is cleared
   - Can't access protected routes

3. **Try accessing** `http://localhost:3000/`

**Expected**: Redirected back to login page

---

### ✅ Step 9: Test Route Protection

1. **Logout** if logged in

2. **Try accessing** `http://localhost:3000/supervisors`

**Expected**: Redirected to `/auth/login?redirect=/supervisors`

3. **Login again**

**Expected**: Redirected back to `/supervisors`

---

## Debugging Common Issues

### Issue: "role_id is undefined"

**Debug Steps**:

1. Open `src/lib/hooks/useAuth.ts`, line ~84
2. Add console.log:
   ```typescript
   onSuccess: (response) => {
     console.log('🔍 Full API Response:', response);
     console.log('🔍 User object:', response.user);
     console.log('🔍 Role ID:', response.user?.role_id);
     // ... rest of code
   }
   ```
3. Login again and check console
4. If `role_id` is missing → **Your backend needs to add it**

---

### Issue: "Permissions not working"

**Debug Steps**:

1. Check auth store:
   ```javascript
   JSON.parse(localStorage.getItem('auth-store'))?.state?.user?.role_id
   ```

2. If `role_id` exists but permissions don't work:
   ```typescript
   import { getRolePermissions } from '@/lib/rbac/permissions';

   // In your component
   console.log('My permissions:', getRolePermissions(user.role_id));
   ```

---

### Issue: "Sidebar is empty"

**Debug Steps**:

1. Check if logged in:
   ```javascript
   !!localStorage.getItem('authToken')
   ```

2. Check sidebar component:
   - Open `src/components/app-sidebar.tsx`
   - Add console.log:
   ```typescript
   console.log('Filtered nav items:', filteredNavItems);
   ```

3. If empty → Check that your `role_id` is valid (2-7)

---

## API Response Verification

Add this to your `.env.local` temporarily:

```bash
NEXT_PUBLIC_DEBUG_MODE=true
```

Then add this to `src/lib/services/apiClient.ts`:

```typescript
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NEXT_PUBLIC_DEBUG_MODE === 'true') {
      console.log('📡 API Response:', {
        url: response.config.url,
        data: response.data,
      });
    }
    return response;
  },
  // ... error handler
);
```

This will log all API responses to help debug.

---

## Success Criteria

Your RBAC system is working correctly if:

- ✅ Login succeeds without errors
- ✅ `role_id` appears in auth store
- ✅ `/rbac-demo` page shows your permissions
- ✅ Sidebar filters based on your role
- ✅ `<Can>` components show/hide correctly
- ✅ Logout clears everything
- ✅ Protected routes redirect to login when not authenticated
- ✅ No TypeScript errors
- ✅ No console errors (except expected warnings)

---

## Still Having Issues?

1. **Check** [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - Ensure your backend returns `role_id`

2. **Check** browser console for errors

3. **Verify** your `.env.local` has correct API URL:
   ```bash
   NEXT_PUBLIC_API_URL=http://your-backend/api
   ```

4. **Test** your backend endpoint directly:
   ```bash
   curl -X POST http://your-backend/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@email.com","password":"00000000"}'
   ```

   Check if response includes `role_id` in user object.

---

## Quick Test Script

Save this as `test-auth.html` and open in browser after logging in:

```html
<!DOCTYPE html>
<html>
<head>
  <title>RBAC Test</title>
</head>
<body>
  <h1>RBAC Quick Test</h1>
  <div id="results"></div>

  <script>
    const results = document.getElementById('results');

    // Get auth store
    const authStore = JSON.parse(localStorage.getItem('auth-store') || '{}');
    const user = authStore?.state?.user;

    // Test results
    const tests = [
      {
        name: 'Auth token exists',
        pass: !!localStorage.getItem('authToken'),
      },
      {
        name: 'User object exists',
        pass: !!user,
      },
      {
        name: 'role_id exists',
        pass: !!user?.role_id,
        value: user?.role_id,
      },
      {
        name: 'role_id is valid (2-7)',
        pass: user?.role_id >= 2 && user?.role_id <= 7,
      },
      {
        name: 'Is authenticated',
        pass: authStore?.state?.isAuthenticated === true,
      },
    ];

    // Display results
    results.innerHTML = tests.map(test => `
      <p style="color: ${test.pass ? 'green' : 'red'}">
        ${test.pass ? '✅' : '❌'} ${test.name}
        ${test.value !== undefined ? `(${test.value})` : ''}
      </p>
    `).join('');

    // Show user data
    results.innerHTML += '<hr><h2>User Data:</h2><pre>' +
      JSON.stringify(user, null, 2) + '</pre>';
  </script>
</body>
</html>
```
