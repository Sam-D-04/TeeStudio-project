import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessAdminPath,
  getDefaultRouteForRole,
  isInternalRole,
} from "./lib/authorization";
import type { UserRole } from "./types/auth";

const isKnownRole = (value: string | undefined): value is UserRole => {
  return ["CUSTOMER", "ADMIN", "WAREHOUSE", "PRODUCTION"].includes(value || "");
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const roleCookie = request.cookies.get("auth_role")?.value;
  const role = isKnownRole(roleCookie) ? roleCookie : null;
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPage) {
    if (!role) {
      const loginUrl = new URL("/dang-nhap", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isInternalRole(role)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (!canAccessAdminPath(role, pathname)) {
      return NextResponse.redirect(
        new URL(getDefaultRouteForRole(role), request.url),
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
