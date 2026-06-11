import type { UserRole } from "@/types/auth";

export const INTERNAL_ROLES: UserRole[] = [
  "ADMIN",
  "WAREHOUSE",
  "PRODUCTION",
];

const ADMIN_PATHS_BY_ROLE: Record<Exclude<UserRole, "CUSTOMER">, string[]> = {
  ADMIN: ["/admin"],
  WAREHOUSE: ["/admin/san-pham-phoi-ao", "/admin/kho-hang"],
  PRODUCTION: ["/admin/don-hang", "/admin/thiet-ke"],
};

export const isInternalRole = (
  role: UserRole | null | undefined,
): role is Exclude<UserRole, "CUSTOMER"> => {
  return Boolean(role && INTERNAL_ROLES.includes(role));
};

export const getDefaultRouteForRole = (role: UserRole): string => {
  if (role === "ADMIN") return "/admin";
  if (role === "WAREHOUSE") return "/admin/san-pham-phoi-ao";
  if (role === "PRODUCTION") return "/admin/don-hang";
  return "/";
};

export const canAccessAdminPath = (
  role: UserRole,
  pathname: string,
): boolean => {
  if (!isInternalRole(role)) return false;
  if (role === "ADMIN") return pathname.startsWith("/admin");

  return ADMIN_PATHS_BY_ROLE[role].some(
    (allowedPath) =>
      pathname === allowedPath || pathname.startsWith(`${allowedPath}/`),
  );
};
