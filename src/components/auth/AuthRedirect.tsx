"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

interface AuthRedirectProps {
  children: React.ReactNode;
}

/**
 * Component that redirects authenticated users away from auth pages
 * Used in auth routes like login, register, reset-password, etc.
 */
export function AuthRedirect({ children }: AuthRedirectProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Check for token in localStorage
    const token = localStorage.getItem("authToken");

    // If user is authenticated and has a token, redirect to dashboard
    if (token && isAuthenticated && isInitialized) {
      router.replace("/");
    }
  }, [isAuthenticated, isInitialized, router]);

  // Show loading while checking auth status
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

  // If authenticated, don't render children (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // Not authenticated, show auth page
  return <>{children}</>;
}