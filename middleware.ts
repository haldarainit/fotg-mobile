import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected admin routes (except login page)
  const protectedAdminRoutes = [
    "/admin",
    "/admin/devices",
    "/admin/reviews",
    "/admin/contact",
  ];

  // Check if accessing protected admin routes
  if (
    protectedAdminRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"))
    && pathname !== "/admin/login"
  ) {
    const token = request.cookies.get("admin_token");

    // If no token, redirect to login
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If logged in and trying to access login page, redirect to admin dashboard
  if (pathname === "/admin/login") {
    const token = request.cookies.get("admin_token");
    if (token) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
