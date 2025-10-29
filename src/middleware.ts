import { NextResponse } from "next/server";

/**
 * IMPORTANT: Next.js middleware runs on the edge and cannot access localStorage.
 * Since your auth tokens are stored in localStorage (not cookies), this middleware
 * cannot check authentication status.
 *
 * Instead, use client-side route protection with <ProtectedRoute> component.
 *
 * This middleware is currently DISABLED but kept for reference.
 * If you want to enable it, store tokens in httpOnly cookies instead of localStorage.
 */

export function middleware() {
  // Middleware is disabled - route protection is handled client-side
  // Route protection is handled by <ProtectedRoute> component
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
