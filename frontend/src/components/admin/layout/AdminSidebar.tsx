"use client";

import {
  AppstoreOutlined,
  BgColorsOutlined,
  CloseOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  InboxOutlined,
  MenuOutlined,
  SettingOutlined,
  SkinOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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
  { label: "Cài đặt", icon: <SettingOutlined />, href: "/admin/cai-dat", allowedRoles: ["ADMIN"] },
];

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
  const role = useAuthStore((state) => state.user?.role);
  const visibleItems = navItems.filter(
    (item) => role && item.allowedRoles.includes(role),
  );

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
    </>
  );
}

export default function AdminSidebar({
  collapsed,
  mobileOpen,
  onClose,
  onToggleCollapse,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}) {
  return (
    <>
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
        className={`fixed left-0 top-0 z-50 flex h-screen w-sidebar-w flex-col border-r border-border bg-surface py-base transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent showCloseButton onClose={onClose} />
      </aside>
    </>
  );
}
