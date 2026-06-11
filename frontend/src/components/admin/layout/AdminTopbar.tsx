"use client";

import {
  AppstoreAddOutlined,
  BellOutlined,
  DownOutlined,
  InboxOutlined,
  LogoutOutlined,
  MenuOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import useAuthStore from "@/store/useAuthStore";
import AdminSearchInput from "../common/AdminSearchInput";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

const quickCreateItems: MenuProps["items"] = [
  { key: "create-b2b-order", icon: <ShoppingCartOutlined />, label: "Tạo đơn B2B" },
  { key: "create-product", icon: <AppstoreAddOutlined />, label: "Thêm phôi áo mới" },
  { key: "create-stock-receipt", icon: <InboxOutlined />, label: "Tạo phiếu nhập kho" },
  { key: "create-customer", icon: <UserAddOutlined />, label: "Thêm khách hàng" },
];

const roleLabels = {
  ADMIN: "Quản trị viên",
  WAREHOUSE: "Thủ kho",
  PRODUCTION: "Thiết kế & in ấn",
  CUSTOMER: "Khách hàng",
};

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleAccountAction: MenuProps["onClick"] = async ({ key }) => {
    if (key !== "logout") return;

    try {
      await authService.logout();
    } catch {
      // Server-side token revocation is best-effort; always clear the local session.
    } finally {
      clearSession();
      router.replace("/dang-nhap");
      router.refresh();
    }
  };

  const handleQuickCreate: MenuProps["onClick"] = ({ key }) => {
    if (key === "create-product") {
      router.push("/admin/san-pham-phoi-ao/them-moi");
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
    { key: "logout", icon: <LogoutOutlined />, label: "Đăng xuất", danger: true },
  ];

  return (
    <header className="admin-topbar">
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          aria-label="Mở menu quản trị"
          onClick={onMenuClick}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-[8px] text-text-secondary hover:bg-surface-alt md:hidden"
        >
          <MenuOutlined className="text-[20px]" />
        </button>
        <AdminSearchInput
          placeholder="Tìm mã đơn, khách hàng..."
          className="hidden w-full max-w-md sm:flex"
        />
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          aria-label="Xem thông báo"
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-surface-alt"
        >
          <BellOutlined className="text-[20px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error" />
        </button>

        {user?.role === "ADMIN" ? (
          <>
            <Dropdown
              menu={{ items: quickCreateItems, onClick: handleQuickCreate }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button type="primary" icon={<PlusOutlined />} className="hidden sm:inline-flex">
                <span className="inline-flex items-center gap-2">
                  Tạo nhanh
                  <DownOutlined className="text-[11px]" />
                </span>
              </Button>
            </Dropdown>
            <Dropdown
              menu={{ items: quickCreateItems, onClick: handleQuickCreate }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <button
                type="button"
                aria-label="Tạo nhanh"
                className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-primary-container text-on-primary shadow-sm transition-colors hover:bg-[#0284c7] sm:hidden"
              >
                <PlusOutlined className="text-[18px]" />
              </button>
            </Dropdown>
          </>
        ) : null}

        <Dropdown
          menu={{ items: accountItems, onClick: handleAccountAction }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <button
            type="button"
            aria-label="Tài khoản"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary-container text-sm font-bold text-on-primary shadow-sm"
          >
            {user?.fullName?.trim().charAt(0).toUpperCase() || "U"}
          </button>
        </Dropdown>
      </div>
    </header>
  );
}
