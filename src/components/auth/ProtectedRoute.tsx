"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("authToken");

    // If no token exists after initialization, redirect to login
    if (!token && isInitialized) {
      // Clear any stale auth state
      if (isAuthenticated) {
        logout();
      }
      router.push("/auth/login");
    }
  }, [isAuthenticated, isInitialized, router, logout]);

  // Show loading or nothing while checking auth
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check token exists
  const token = localStorage.getItem("authToken");
  if (!token) {
    return null;
  }

  return <>{children}</>;
}
