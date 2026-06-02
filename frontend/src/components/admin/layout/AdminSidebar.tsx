"use client";

import {
  AppstoreOutlined,
  BgColorsOutlined,
  CloseOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  InboxOutlined,
  SettingOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  icon: ReactNode;
  href: string; // Đường dẫn thực tế cho từng mục menu
};

// Danh sách các mục menu sidebar với đường dẫn tương ứng
const navItems: NavItem[] = [
  { label: "Tổng quan",  icon: <DashboardOutlined />,    href: "/admin" },
  { label: "Đơn hàng",  icon: <ShoppingCartOutlined />,  href: "/admin/don-hang" },
  { label: "Thiết kế",  icon: <BgColorsOutlined />,      href: "/admin/thiet-ke" },
  { label: "Sản xuất",  icon: <ToolOutlined />,          href: "/admin/san-xuat" },
  { label: "Kho hàng",  icon: <InboxOutlined />,         href: "/admin/kho-hang" },
  { label: "Thanh toán",icon: <CreditCardOutlined />,    href: "/admin/thanh-toan" },
  { label: "Cài đặt",   icon: <SettingOutlined />,       href: "/admin/cai-dat" },
];

function SidebarContent({
  showCloseButton = false,
  onClose,
}: {
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  // usePathname trả về đường dẫn hiện tại (ví dụ: "/admin/don-hang")
  // Dùng để xác định mục menu nào đang được chọn (active)
  const pathname = usePathname();

  return (
    <>
      {/* Logo + tên hệ thống */}
      <div className="mb-8 flex items-center gap-3 px-base">
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary text-on-primary">
          <AppstoreOutlined className="text-[22px]" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[20px] font-black leading-tight text-primary">
            TeeStudio
          </h1>
          <p className="text-body-sm text-text-secondary">Quản trị sản xuất</p>
        </div>
        {showCloseButton ? (
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

      {/* Danh sách các mục menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            // Kiểm tra xem đường dẫn hiện tại có khớp với mục menu không
            // Đặc biệt: "/admin" chỉ active khi đúng "/admin", không active khi là "/admin/don-hang"
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            // Class cho mục đang active và mục thường
            const itemClass = isActive
              ? "bg-secondary-fixed text-on-secondary-fixed-variant"  // Xanh nhạt + chữ xanh đậm
              : "text-text-secondary hover:bg-surface-alt hover:text-primary"; // Xám, hover xanh

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose} // Đóng menu mobile khi chọn mục
                  className={`mx-2 flex items-center gap-3 rounded-[8px] px-4 py-2 text-sidebar-item font-semibold transition-colors ${itemClass}`}
                >
                  <span className="flex text-[22px] leading-none">{item.icon}</span>
                  <span>{item.label}</span>
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
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside
        className="admin-sidebar-desktop"
      >
        <SidebarContent />
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
