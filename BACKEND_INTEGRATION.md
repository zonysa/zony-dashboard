# Backend Integration Guide

## What I Did vs What Your Backend Needs

### ✅ What I Implemented (CLIENT-SIDE ONLY)

I **DID NOT** create any server-side API routes or backend logic. Everything I did is **CLIENT-SIDE** and works with your **EXISTING BACKEND API**.

Here's what I added:

1. **Zustand Store** - Client-side state management for user data
2. **RBAC System** - Client-side permission checking
3. **React Components** - UI components that check permissions
4. **Middleware** - Next.js middleware (runs on the edge, not your backend)

### 🔗 How It Integrates With Your Existing API

Your existing setup:
```
LoginForm → useLogin() → auth.service.ts → apiClient.ts → YOUR BACKEND API
```

What I added:
```
LoginForm → useLogin() → auth.service.ts → apiClient.ts → YOUR BACKEND API
                ↓
         Updates Zustand Store (NEW)
                ↓
         Enables RBAC features (NEW)
```

**Nothing changed in your API calls!** I only added code that runs AFTER your API responds.

---

## Your Current API Setup

### File: `src/lib/services/apiClient.ts`
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,  // Points to YOUR backend server
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

### File: `src/lib/services/auth.service.ts`
```typescript
export const login = async (data: LoginFormData): Promise<LoginResponse> => {
  return apiCall({
    method: "POST",
    url: "/auth/login",  // Calls YOUR backend at ${API_BASE_URL}/auth/login
    data,
  });
};
```

**These files are UNCHANGED** - they still call your backend server.

---

## What Your Backend MUST Return

For the RBAC system to work, your backend's login endpoint must return a `role_id` field in the user object.

### Current Response (What You Likely Have)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "admin@email.com",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "phone_number": "1234567890",
    "avatar": null,
    "birth_date": null,
    "city": null,
    "country": null,
    "gender": null,
    "identity": null,
    "is_active": true,
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
    // ❌ MISSING: role_id
  }
}
```

### Required Response (What You Need)
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "admin@email.com",
    "first_name": "John",
    "last_name": "Doe",
    "username": "johndoe",
    "phone_number": "1234567890",
    "avatar": null,
    "birth_date": null,
    "city": null,
    "country": null,
    "gender": null,
    "identity": null,
    "is_active": true,
    "last_login": "2024-01-15T10:30:00Z",
    "created_at": "2023-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z",
    "role_id": 4,  // ✅ REQUIRED: Must be a number from 2-7
    "role": {      // ⭐ Optional but recommended
      "id": 4,
      "name": "Supervisor"
    }
  }
}
```

---

## Role ID Values

Your backend must use these role IDs:

| Role ID | Role Name          | Description |
|---------|-------------------|-------------|
| 2       | Representative     | Sales and partnership representatives |
| 3       | Responsible        | Account managers |
| 4       | Supervisor         | Full access to everything |
| 5       | Customer Service   | Customer support team |
| 6       | Courier            | Delivery personnel |
| 7       | Customer           | End customers |

---

## Testing Your Backend Integration

### Step 1: Check Your Current API Response

Open your browser console and add this to your login success handler temporarily:

```typescript
onSuccess: (response) => {
  console.log("Login Response:", JSON.stringify(response, null, 2));
  // Check if response.user.role_id exists
}
```

### Step 2: Verify the Response

After logging in, check the console. You should see:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": {
    ...
    "role_id": 4  // ← This must exist!
  }
}
```

### Step 3: If role_id is Missing

Contact your backend developer and ask them to:
1. Add `role_id` field to the user model/serializer
2. Include it in the login response
3. Use values 2-7 (matching our role system)

---

## Backend Changes Required

### Option 1: Backend Already Has Roles
If your backend already has a roles system, just:
1. Map your existing roles to IDs 2-7
2. Include `role_id` in the login response

### Option 2: Backend Needs Roles Added
Your backend developer needs to:

1. **Add role field to User model** (example in Django/Python):
```python
class User(models.Model):
    # ... existing fields
    role_id = models.IntegerField(
        choices=[
            (2, 'Representative'),
            (3, 'Responsible'),
            (4, 'Supervisor'),
            (5, 'Customer Service'),
            (6, 'Courier'),
            (7, 'Customer'),
        ]
    )
```

2. **Update login serializer** to include role_id:
```python
class LoginResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', ..., 'role_id']
```

---

## Testing After Backend Changes

Once your backend returns `role_id`:

1. **Login** with different users
2. **Open browser console**:
   ```javascript
   // Check the Zustand store
   localStorage.getItem('auth-store')
   ```
3. **Visit** `/rbac-demo` page to see all permissions
4. **Check sidebar** - should only show allowed items

---

## Common Issues & Solutions

### Issue 1: "role_id is undefined"
**Solution**: Your backend is not returning `role_id` in the user object. Contact your backend developer.

### Issue 2: "TypeError: Cannot read property 'role_id' of undefined"
**Solution**: The login response doesn't include a `user` object. Check your API structure.

### Issue 3: "Permissions not working"
**Solution**: Check that:
1. `role_id` is a number (not a string)
2. `role_id` is between 2-7
3. You're logged in

### Issue 4: "Sidebar shows nothing"
**Solution**: Either:
- You're not logged in
- Your role has no permissions (check `src/lib/rbac/permissions.ts`)
- `role_id` is invalid

---

## Environment Variables

Make sure you have this in your `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://your-backend-server.com/api
```

This is where all API calls go. I didn't change this.

---

## What Happens During Login

```
1. User enters email/password
   ↓
2. LoginForm calls useLogin() hook
   ↓
3. useLogin() calls your backend API
   ↓
4. Your backend returns: { access_token, refresh_token, user }
   ↓
5. useLogin() stores tokens in localStorage
   ↓
6. useLogin() updates Zustand store with user data ← (NEW)
   ↓
7. User is redirected to dashboard
   ↓
8. Sidebar filters navigation based on role_id ← (NEW)
   ↓
9. Components check permissions using role_id ← (NEW)
```

---

## Summary

### What I Changed:
- ✅ Added Zustand store for client-side state
- ✅ Created RBAC permission system
- ✅ Updated User type to include `role_id`
- ✅ Modified login/logout hooks to update store
- ✅ Added permission checking components
- ✅ Updated sidebar to filter by permissions

### What I Did NOT Change:
- ❌ Your API endpoints
- ❌ Your backend server
- ❌ Your authentication logic
- ❌ Your API base URL
- ❌ How tokens are stored

### What Your Backend Needs:
- ⚠️ Include `role_id` field (number 2-7) in login response

---

## Need Help?

If your backend developer needs the exact specification, share this:

**Required Field**: `role_id`
**Type**: Integer
**Valid Values**: 2, 3, 4, 5, 6, or 7
**Location**: In the `user` object of the login response
**Example**:
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "role_id": 4
  }
}
```
