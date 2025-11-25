import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected admin routes (except login page)
  const protectedAdminRoutes = [
    "/admin",
    "/admin/devices",
    "/admin/reviews",
    "/admin/contact",
    "/admin/bookings",
    "/admin/settings",
  ];

  // Check if accessing protected admin routes
  if (
    protectedAdminRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
    && pathname !== "/admin/login"
  ) {
    const token = request.cookies.get("admin_token")?.value;

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Verify token is valid
    const payload = await verifyTokenEdge(token);
    if (!payload) {
      // Token is invalid or expired, clear it and redirect to login
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }

    // Check if user has admin role
    if (payload.role !== "admin") {
      const loginUrl = new URL("/admin/login", request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("admin_token");
      return response;
    }
  }

  // If logged in and trying to access login page, redirect to admin dashboard
  if (pathname === "/admin/login") {
    const token = request.cookies.get("admin_token")?.value;
    if (token) {
      // Verify token before redirecting
      const payload = await verifyTokenEdge(token);
      if (payload && payload.role === "admin") {
        const adminUrl = new URL("/admin", request.url);
        return NextResponse.redirect(adminUrl);
      } else {
        // Invalid token, clear it
        const response = NextResponse.next();
        response.cookies.delete("admin_token");
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
