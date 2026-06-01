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
import type { ReactNode } from "react";

type NavItem = {
  label: string;
  icon: ReactNode;
  active?: boolean;
};

const navItems: NavItem[] = [
  { label: "Tổng quan", icon: <DashboardOutlined />, active: true },
  { label: "Đơn hàng", icon: <ShoppingCartOutlined /> },
  { label: "Thiết kế", icon: <BgColorsOutlined /> },
  { label: "Sản xuất", icon: <ToolOutlined /> },
  { label: "Kho hàng", icon: <InboxOutlined /> },
  { label: "Thanh toán", icon: <CreditCardOutlined /> },
  { label: "Cài đặt", icon: <SettingOutlined /> },
];

function SidebarContent({
  showCloseButton = false,
  onClose,
}: {
  showCloseButton?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
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

      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const itemClass = item.active
              ? "bg-secondary-fixed text-on-secondary-fixed-variant"
              : "text-text-secondary hover:bg-surface-alt hover:text-primary";

            return (
              <li key={item.label}>
                <a
                  href="#"
                  onClick={onClose}
                  className={`mx-2 flex items-center gap-3 rounded-[8px] px-4 py-2 text-sidebar-item font-semibold transition-colors ${itemClass}`}
                >
                  <span className="flex text-[22px] leading-none">{item.icon}</span>
                  <span>{item.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default function AdminSidebar({
  isDesktop,
  mobileOpen,
  onClose,
}: {
  isDesktop: boolean;
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside
        className="admin-sidebar-desktop"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 30,
          display: isDesktop ? "flex" : "none",
          width: 260,
          height: "100vh",
          flexDirection: "column",
          borderRight: "1px solid #e2e8f0",
          background: "#ffffff",
          paddingTop: 24,
          paddingBottom: 24,
        }}
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
