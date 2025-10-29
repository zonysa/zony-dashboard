import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { User } from "@/lib/schema/auth.schema";
import { Permission } from "@/lib/rbac/permissions";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
} from "@/lib/rbac/permissions";
import { getRoleName } from "@/lib/rbac/roles";

interface AuthStore {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  initialize: () => void;

  // Permission checkers
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;

  // Getters
  getRole: () => string | null;
  getRoleName: () => string | null;
  getPermissions: () => Permission[];
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        isInitialized: false,

        // Actions
        setUser: (user) => {
          set({
            user,
            isAuthenticated: !!user,
          });
        },

        logout: () => {
          // Clear tokens from localStorage
          if (typeof window !== "undefined") {
            localStorage.removeItem("authToken");
            localStorage.removeItem("refreshToken");
            sessionStorage.clear();
          }

          // Reset auth state
          set({
            user: null,
            isAuthenticated: false,
          });
        },

        initialize: () => {
          set({ isInitialized: true });
        },

        // Permission checkers
        hasPermission: (permission: Permission) => {
          const { user } = get();
          return user ? hasPermission(user.role, permission) : false;
        },

        hasAnyPermission: (permissions: Permission[]) => {
          const { user } = get();
          return user ? hasAnyPermission(user.role, permissions) : false;
        },

        hasAllPermissions: (permissions: Permission[]) => {
          const { user } = get();
          return user ? hasAllPermissions(user.role, permissions) : false;
        },

        // Getters
        getRole: () => {
          const { user } = get();
          return user?.role || null;
        },

        getRoleName: () => {
          const { user } = get();
          return user ? getRoleName(user.role) : null;
        },

        getPermissions: () => {
          const { user } = get();
          return user ? getRolePermissions(user.role) : [];
        },
      }),
      {
        name: "auth-store",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    {
      name: "auth-store",
    }
  )
);

// Selector hooks for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);
export const useUserRole = () => {
  const user = useAuthStore((state) => state.user);
  const getRoleName = useAuthStore((state) => state.getRoleName);
  return {
    role: user?.role || null,
    roleName: getRoleName(),
  };
};
