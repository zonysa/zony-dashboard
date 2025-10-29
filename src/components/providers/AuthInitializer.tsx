"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

/**
 * Component that initializes the auth store on app mount
 * This ensures the auth state is loaded from localStorage when the app starts
 */
export function AuthInitializer({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Mark auth as initialized
    initialize();
  }, [initialize]);

  return <>{children}</>;
}
