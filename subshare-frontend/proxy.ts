import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;
  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register", "/forgot-password", "/blog", "/help-center"];
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith("/subscription/"));

  // Admin routes
  const isAdminRoute = pathname.startsWith("/admin");

  // User routes
  const isUserRoute = pathname.startsWith("/dashboard") || 
                      pathname.startsWith("/wallet") || 
                      pathname.startsWith("/share-subscription") ||
                      pathname.startsWith("/my-shares") ||
                      pathname.startsWith("/my-access") ||
                      pathname.startsWith("/profile");

  // If trying to access protected route without token, redirect to login
  if ((isAdminRoute || isUserRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in and trying to access login/register, redirect to dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

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