# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server (Next.js + Turbopack), http://localhost:3000
npm run build    # Production build (Turbopack)
npm run start    # Serve a production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript configs)
npx tsc --noEmit # Type-check only (no separate "typecheck" script exists)
```

There is no test suite or test runner configured in this repo (no jest/vitest/playwright, no `*.test.*`/`*.spec.*` files). Don't assume one exists when asked to "run the tests."

Requires `NEXT_PUBLIC_API_URL` in `.env.local` (base URL of the backend API).

## Architecture

This is a Next.js 15 App Router dashboard (React 19, TypeScript, Tailwind v4, shadcn/ui "new-york" style). The `@/*` path alias maps to `src/*`.

### It's a client-rendered app, not a server-rendered one

Nearly every page and component is `"use client"`. Auth tokens live in `localStorage`, so `src/middleware.ts` is explicitly a no-op (edge middleware can't read localStorage) — it's kept only as a documented placeholder. All auth/route protection happens client-side at render time (see below). Don't try to move auth logic into middleware or server components without also changing where tokens are stored.

### Layered data flow: schema → service → hook → UI

Every domain (partners, parcels, pudos, zones, tickets, users, etc.) follows the same pipeline, split across four parallel directory trees under `src/lib/`:

1. **`lib/schema/*.schema.ts`** — Zod schemas + inferred TypeScript types (request/response shapes, form data types).
2. **`lib/services/*.service.ts`** — Plain async functions that call `apiCall<T>()` from `lib/services/apiClient.ts` with a method/url/data config. No business logic here beyond building query params.
3. **`lib/hooks/use<Domain>.ts`** — TanStack Query wrappers (`useQuery`/`useMutation`) around the service functions, with consistent query-key factories (`domainKeys.all/lists/list/details/detail`), shared `staleTime`/`gcTime`/retry-with-backoff settings, and `sonner` toasts on mutation success/error.
4. **Components/forms** — consume the hooks; never call services or `apiCall` directly.

When adding a new domain or endpoint, follow this same four-layer pattern rather than fetching ad hoc from a component.

**Two API client files exist** — only one is real:
- `lib/services/apiClient.ts` is the actual client used everywhere: reads `authToken`/`refreshToken` from `localStorage`, auto-refreshes on 401 (except for `/auth/login`, `/auth/register`, `/auth/refresh` themselves), and redirects to `/auth/login` on refresh failure. Exposes `apiCall<T>()` and `ApiError` (carries HTTP `status`).
- `lib/config/axois.ts` is dead legacy code (note the typo in the filename) — nothing imports it. Don't use or "fix" it; if touching auth/API config, `lib/services/apiClient.ts` is the one that matters.

### Auth & RBAC

- **State**: `lib/stores/auth-store.ts` — a Zustand store (persisted to `localStorage` under `auth-store`, `devtools`-wrapped) holding `user`/`isAuthenticated`/`isInitialized` plus permission-check methods. `AuthInitializer` (in the root layout) calls `initialize()` on mount.
- **Roles**: `lib/rbac/roles.ts` — `UserRole` is a **string union** (`"admin" | "supervisor" | "representative" | "responsible" | "customer_service" | "courier" | "customer"`) matching the string the backend returns in `user.role`. `normalizeRole()` maps loose backend variants onto this set.
- **Permissions**: `lib/rbac/permissions.ts` — a `Permission` enum (e.g. `Permission.EDIT_PARTNERS`) and a `ROLE_PERMISSIONS` map from role → permission list.
- **Route protection**: `lib/rbac/route-permissions.ts` maps route paths to required `Permission`(s); `RoutePermissionGuard` (wraps everything inside `app/(protected)/layout.tsx`) checks the current pathname against it and renders `AccessDenied` on mismatch. `ProtectedRoute` (also in that layout) separately redirects to `/auth/login` if no `authToken` is present.
- **In-component checks**: use the `<Can do={Permission.X}>` component, `<RoleGuard>`, or the `usePermissions()` hook rather than reading `useAuthStore` role state ad hoc.
- Routes live in the `app/(protected)/` route group (dashboard pages, requires auth) vs `app/auth/` (login/signup/OTP/reset, public).
- **Stale docs warning**: `docs/*RBAC*.md`, `docs/BACKEND_INTEGRATION.md`, and `TEST_RBAC.md` describe an older design (numeric `role_id` 2–7, six roles). The codebase has since moved to the string-role system described above (`src/lib/rbac/`). Treat those docs as historical background, not current behavior.

### Forms

- `react-hook-form` + `@hookform/resolvers/zod` against the Zod schemas in `lib/schema/`.
- Multi-step forms use `lib/hooks/useMutliStepForm.tsx` (yes, that's the actual filename) together with the generic `MultiStepForm`/`StepNavigation`/`ProgressBar` components in `src/forms/`. Each domain's step components live in their own subfolder (`src/forms/partners/`, `src/forms/pudo/`, `src/forms/parcel/`), implementing the `StepComponentProps<T>` interface (`form`, `onNext`, `onBack`, `isFirstStep`, `isLastStep`, etc.).
- Some multi-step flows additionally persist in-progress data in a dedicated Zustand store (e.g. `lib/stores/partner-form-store.ts` tracks `currentStep`/`formData` for the partner creation wizard) so drafts survive navigation/refresh.
- Cascading location selects (city → district/zone) recur across partner, pudo, and zone forms/dialogs — city selection scopes which districts/zones are selectable, and changing the city should reset any now-invalid district/zone selection (see recent commits like `fix(pudos): scope zone filter to city and reset stale selection`). Keep this constraint in mind when touching location fields.

### i18n

`react-i18next`, configured in `lib/i18n/config.ts` with locale files at `lib/i18n/locales/{en,ar}/common.json`. Use the `useTranslation()` hook from `lib/hooks/useTranslation.ts` (not `react-i18next`'s directly) — it also exposes `isRTL` (true when language is `"ar"`), which layout code uses to flip sidebar side, etc.

### UI components

`src/components/ui/` holds shadcn/ui primitives (`new-york` style, Tailwind, `cn()` utility) — treat these as generated/library code and prefer composing them over editing, consistent with normal shadcn usage. Feature-specific components live alongside by domain (`components/parcels/`, `components/zone/`, `components/tables/`, etc.).

### Commit style

Recent history follows Conventional Commits with the feature area as scope, e.g. `fix(pudos): scope zone filter to city and reset stale selection`, `feat(partners): use compact row-style file input for commercial registration`.
