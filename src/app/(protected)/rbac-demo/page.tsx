"use client";

import { ProtectedRoute, Can, RoleGuard } from "@/components/auth";
import { Permission } from "@/lib/rbac/permissions";
import { UserRole } from "@/lib/rbac/roles";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { useUser } from "@/lib/stores/auth-store";

export default function RBACDemoPage() {
  const user = useUser();
  const {
    roleId,
    roleName,
    hasPermission,
    hasAnyPermission,
    isSupervisor,
    canCreate,
    canEdit,
    canDelete,
  } = usePermissions();

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-8 space-y-8">
        <h1 className="text-3xl font-bold">RBAC Demo Page</h1>
        <p className="text-muted-foreground">
          This page demonstrates all role-based access control features.
        </p>

        {/* User Info Section */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Current User Info</h2>
          {user && (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user.first_name} {user.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Role ID:</strong> {roleId}
              </p>
              <p>
                <strong>Role Name:</strong> {roleName || "Unknown"}
              </p>
              <p>
                <strong>Is Supervisor:</strong> {isSupervisor() ? "Yes" : "No"}
              </p>
            </div>
          )}
        </section>

        {/* Permission Checks Section */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Permission Checks</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-semibold mb-2">Supervisors</h3>
              <ul className="space-y-1">
                <li>
                  View:{" "}
                  {hasPermission(Permission.VIEW_SUPERVISORS) ? "✅" : "❌"}
                </li>
                <li>
                  Create:{" "}
                  {hasPermission(Permission.CREATE_SUPERVISORS) ? "✅" : "❌"}
                </li>
                <li>
                  Edit:{" "}
                  {hasPermission(Permission.EDIT_SUPERVISORS) ? "✅" : "❌"}
                </li>
                <li>
                  Delete:{" "}
                  {hasPermission(Permission.DELETE_SUPERVISORS) ? "✅" : "❌"}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Partners</h3>
              <ul className="space-y-1">
                <li>
                  View: {hasPermission(Permission.VIEW_PARTNERS) ? "✅" : "❌"}
                </li>
                <li>
                  Create:{" "}
                  {hasPermission(Permission.CREATE_PARTNERS) ? "✅" : "❌"}
                </li>
                <li>
                  Edit: {hasPermission(Permission.EDIT_PARTNERS) ? "✅" : "❌"}
                </li>
                <li>
                  Delete:{" "}
                  {hasPermission(Permission.DELETE_PARTNERS) ? "✅" : "❌"}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Parcels</h3>
              <ul className="space-y-1">
                <li>
                  View: {hasPermission(Permission.VIEW_PARCELS) ? "✅" : "❌"}
                </li>
                <li>
                  Create: {canCreate(Permission.CREATE_PARCELS) ? "✅" : "❌"}
                </li>
                <li>
                  Edit: {canEdit(Permission.EDIT_PARCELS) ? "✅" : "❌"}
                </li>
                <li>
                  Delete: {canDelete(Permission.DELETE_PARCELS) ? "✅" : "❌"}
                </li>
                <li>
                  Track: {hasPermission(Permission.TRACK_PARCELS) ? "✅" : "❌"}
                </li>
                <li>
                  Assign:{" "}
                  {hasPermission(Permission.ASSIGN_PARCELS) ? "✅" : "❌"}
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Reports</h3>
              <ul className="space-y-1">
                <li>
                  View: {hasPermission(Permission.VIEW_REPORTS) ? "✅" : "❌"}
                </li>
                <li>
                  Export:{" "}
                  {hasPermission(Permission.EXPORT_REPORTS) ? "✅" : "❌"}
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Can Component Demo */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">
            Can Component Demo (Single Permission)
          </h2>
          <div className="flex flex-wrap gap-4">
            <Can do={Permission.VIEW_SUPERVISORS}>
              <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                View Supervisors
              </button>
            </Can>

            <Can do={Permission.CREATE_PARTNERS}>
              <button className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
                Create Partner
              </button>
            </Can>

            <Can do={Permission.EDIT_PARCELS}>
              <button className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
                Edit Parcel
              </button>
            </Can>

            <Can do={Permission.DELETE_CLIENTS}>
              <button className="rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600">
                Delete Client
              </button>
            </Can>
          </div>
        </section>

        {/* Multiple Permissions (OR) */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">
            Multiple Permissions Demo (OR)
          </h2>
          <p className="text-sm text-muted-foreground">
            User needs ANY of the listed permissions
          </p>
          <div className="flex flex-wrap gap-4">
            <Can
              do={[Permission.CREATE_PARCELS, Permission.EDIT_PARCELS]}
              requireAll={false}
            >
              <button className="rounded bg-purple-500 px-4 py-2 text-white hover:bg-purple-600">
                Manage Parcels (Create OR Edit)
              </button>
            </Can>

            <Can
              do={[
                Permission.VIEW_SUPERVISORS,
                Permission.VIEW_PARTNERS,
                Permission.VIEW_PUDOS,
              ]}
              requireAll={false}
            >
              <button className="rounded bg-indigo-500 px-4 py-2 text-white hover:bg-indigo-600">
                View Management Pages
              </button>
            </Can>
          </div>
        </section>

        {/* Multiple Permissions (AND) */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">
            Multiple Permissions Demo (AND)
          </h2>
          <p className="text-sm text-muted-foreground">
            User needs ALL of the listed permissions
          </p>
          <div className="flex flex-wrap gap-4">
            <Can
              do={[Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS]}
              requireAll={true}
            >
              <button className="rounded bg-teal-500 px-4 py-2 text-white hover:bg-teal-600">
                Export Reports (View AND Export)
              </button>
            </Can>

            <Can
              do={[
                Permission.CREATE_PARCELS,
                Permission.EDIT_PARCELS,
                Permission.DELETE_PARCELS,
              ]}
              requireAll={true}
            >
              <button className="rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
                Full Parcel Management (Create AND Edit AND Delete)
              </button>
            </Can>
          </div>
        </section>

        {/* Role Guard Demo */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Role Guard Demo</h2>

          <div className="space-y-4">
            <RoleGuard
              allowedRoles={[UserRole.SUPERVISOR]}
              fallback={
                <div className="rounded border border-red-500 bg-red-50 p-4 text-red-700">
                  Only Supervisors can see this content
                </div>
              }
            >
              <div className="rounded border border-green-500 bg-green-50 p-4 text-green-700">
                🎉 Supervisor-only content visible!
              </div>
            </RoleGuard>

            <RoleGuard
              allowedRoles={[UserRole.REPRESENTATIVE, UserRole.RESPONSIBLE]}
              fallback={
                <div className="rounded border border-yellow-500 bg-yellow-50 p-4 text-yellow-700">
                  Only Representatives and Responsible users can see this
                </div>
              }
            >
              <div className="rounded border border-blue-500 bg-blue-50 p-4 text-blue-700">
                🎉 Representative/Responsible content visible!
              </div>
            </RoleGuard>

            <RoleGuard
              allowedRoles={[
                UserRole.CUSTOMER_SERVICE,
                UserRole.COURIER,
                UserRole.CUSTOMER,
              ]}
              fallback={
                <div className="rounded border border-purple-500 bg-purple-50 p-4 text-purple-700">
                  Only Customer Service, Couriers, and Customers can see this
                </div>
              }
            >
              <div className="rounded border border-indigo-500 bg-indigo-50 p-4 text-indigo-700">
                🎉 Customer Service/Courier/Customer content visible!
              </div>
            </RoleGuard>
          </div>
        </section>

        {/* Conditional Rendering */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">
            Conditional Rendering with Hooks
          </h2>
          <div className="space-y-2">
            {isSupervisor() && (
              <p className="text-green-600">
                ✅ You are a supervisor with full access!
              </p>
            )}

            {hasPermission(Permission.VIEW_REPORTS) && (
              <p className="text-blue-600">✅ You can view reports</p>
            )}

            {hasAnyPermission([
              Permission.CREATE_PARCELS,
              Permission.EDIT_PARCELS,
            ]) && (
              <p className="text-purple-600">
                ✅ You can create or edit parcels
              </p>
            )}

            {canEdit(Permission.EDIT_PARTNERS) && (
              <p className="text-yellow-600">✅ You can edit partners</p>
            )}

            {canDelete(Permission.DELETE_CLIENTS) && (
              <p className="text-red-600">✅ You can delete clients</p>
            )}
          </div>
        </section>

        {/* Implementation Code Examples */}
        <section className="space-y-4 rounded-lg border p-6">
          <h2 className="text-2xl font-semibold">Code Examples</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Using Can Component</h3>
              <pre className="rounded bg-gray-100 p-4 text-sm overflow-x-auto">
                {`<Can do={Permission.CREATE_PARCELS}>
  <button>Create Parcel</button>
</Can>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Using RoleGuard</h3>
              <pre className="rounded bg-gray-100 p-4 text-sm overflow-x-auto">
                {`<RoleGuard allowedRoles={[UserRole.SUPERVISOR]}>
  <AdminPanel />
</RoleGuard>`}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Using Hooks</h3>
              <pre className="rounded bg-gray-100 p-4 text-sm overflow-x-auto">
                {`const { hasPermission, isSupervisor } = usePermissions();

if (hasPermission(Permission.VIEW_REPORTS)) {
  // Show reports
}

if (isSupervisor()) {
  // Show admin features
}`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </ProtectedRoute>
  );
}
