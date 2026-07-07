"use client";

import {
  AppstoreOutlined,
  BgColorsOutlined,
  CloseOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  DownOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuOutlined,
  SkinOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";
import type { UserRole } from "@/types/auth";

type NavItem = {
  label: string;
  icon: ReactNode;
  href: string;
  allowedRoles: UserRole[];
};

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: <DashboardOutlined />, href: "/admin", allowedRoles: ["ADMIN"] },
  { label: "Đơn hàng", icon: <ShoppingCartOutlined />, href: "/admin/don-hang", allowedRoles: ["ADMIN", "PRODUCTION"] },
  { label: "Sản phẩm / Phôi áo", icon: <SkinOutlined />, href: "/admin/san-pham-phoi-ao", allowedRoles: ["ADMIN", "WAREHOUSE"] },
  { label: "Thiết kế & In ấn", icon: <BgColorsOutlined />, href: "/admin/thiet-ke", allowedRoles: ["ADMIN", "PRODUCTION"] },
  { label: "Kho hàng", icon: <InboxOutlined />, href: "/admin/kho-hang", allowedRoles: ["ADMIN", "WAREHOUSE"] },
  { label: "Thanh toán", icon: <CreditCardOutlined />, href: "/admin/thanh-toan", allowedRoles: ["ADMIN"] },
  { label: "Khuyến mãi & Báo giá", icon: <TagsOutlined />, href: "/admin/khuyen-mai-bao-gia", allowedRoles: ["ADMIN"] },
  { label: "Tài khoản", icon: <TeamOutlined />, href: "/admin/tai-khoan", allowedRoles: ["ADMIN"] },
];

const roleLabels: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  WAREHOUSE: "Thủ kho",
  PRODUCTION: "Thiết kế & in ấn",
  CUSTOMER: "Khách hàng",
};

function SidebarContent({
  collapsed = false,
  showCloseButton = false,
  onClose,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  showCloseButton?: boolean;
  onClose?: () => void;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const role = user?.role;
  const visibleItems = navItems.filter(
    (item) => role && item.allowedRoles.includes(role),
  );

  const handleAccountAction: MenuProps["onClick"] = async ({ key }) => {
    if (key !== "logout") return;

    try {
      await authService.logout();
    } catch {
      // Thu hồi token phía máy chủ là best-effort; luôn xóa phiên cục bộ.
    } finally {
      clearSession();
      onClose?.();
      router.replace("/dang-nhap");
      router.refresh();
    }
  };

  const accountItems: MenuProps["items"] = [
    {
      key: "identity",
      icon: <UserOutlined />,
      label: (
        <div>
          <div className="font-semibold">{user?.fullName}</div>
          <div className="text-xs text-slate-500">
            {user ? roleLabels[user.role] : ""}
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  return (
    <>
      <div
        className={`mb-8 flex items-center ${
          collapsed ? "justify-center px-2" : "gap-3 px-base"
        }`}
      >
        {collapsed ? null : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary text-on-primary">
              <AppstoreOutlined className="text-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-[20px] font-black leading-tight text-primary">
                TeeStudio
              </h1>
              <p className="text-body-sm text-text-secondary">Quản trị sản xuất</p>
            </div>
          </>
        )}

        {onToggleCollapse ? (
          <button
            type="button"
            aria-label={collapsed ? "Mở rộng menu quản trị" : "Thu gọn menu quản trị"}
            aria-expanded={!collapsed}
            onClick={onToggleCollapse}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
          >
            <MenuOutlined className="text-[20px]" />
          </button>
        ) : showCloseButton ? (
          <button
            type="button"
            aria-label="Đóng menu quản trị"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[8px] text-text-secondary hover:bg-surface-alt"
          >
            <CloseOutlined />
          </button>
        ) : null}
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const itemClass = isActive
              ? "bg-secondary-fixed text-on-secondary-fixed-variant"
              : "text-text-secondary hover:bg-surface-alt hover:text-primary";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  className={`mx-2 flex h-11 items-center rounded-[8px] py-2 text-sidebar-item font-semibold transition-colors ${
                    collapsed ? "justify-center px-0" : "min-w-0 gap-3 px-4"
                  } ${itemClass}`}
                >
                  <span className="flex shrink-0 text-[22px] leading-none">{item.icon}</span>
                  <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mx-2 mt-4 border-t border-border pt-4">
        <Dropdown
          menu={{ items: accountItems, onClick: handleAccountAction }}
          trigger={["click"]}
          placement="topRight"
          open={accountMenuOpen}
          onOpenChange={setAccountMenuOpen}
        >
          <button
            type="button"
            aria-label="Tài khoản quản trị"
            aria-expanded={accountMenuOpen}
            title={collapsed ? user?.fullName || "Tài khoản" : undefined}
            className={`flex h-14 w-full items-center rounded-[8px] text-left transition-colors hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              collapsed ? "justify-center px-0" : "min-w-0 gap-3 px-2"
            }`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary shadow-sm">
              {user?.fullName?.trim().charAt(0).toUpperCase() || "U"}
            </span>
            {collapsed ? null : (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-text-primary">
                    {user?.fullName || "Tài khoản"}
                  </span>
                  <span className="block truncate text-xs text-text-secondary">
                    {user ? roleLabels[user.role] : ""}
                  </span>
                </span>
                <DownOutlined
                  className={`shrink-0 text-[11px] text-text-secondary transition-transform duration-200 ${
                    accountMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </>
            )}
          </button>
        </Dropdown>
      </div>
    </>
  );
}

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapse,
  onOpenMobile,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
}) {
  return (
    <>
      {mobileOpen ? null : (
        <button
          type="button"
          aria-label="Mở menu quản trị"
          aria-controls="admin-mobile-sidebar"
          aria-expanded={false}
          onClick={onOpenMobile}
          className="fixed bottom-5 right-5 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95 md:hidden"
        >
          <MenuOutlined className="text-[20px]" />
        </button>
      )}

      <aside className="admin-sidebar-desktop" data-collapsed={collapsed}>
        <SidebarContent collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Đóng lớp phủ menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
        />
      ) : null}

      <aside
        id="admin-mobile-sidebar"
        className={`fixed left-0 top-0 z-50 flex h-screen w-sidebar-w flex-col border-r border-border bg-surface py-base transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent showCloseButton onClose={onClose} />
      </aside>
    </>
  );
}
