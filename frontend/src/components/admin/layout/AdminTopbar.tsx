"use client";

import {
  AppstoreAddOutlined,
  BellOutlined,
  DownOutlined,
  InboxOutlined,
  MenuOutlined,
  PlusOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import AdminSearchInput from "../common/AdminSearchInput";

type AdminTopbarProps = {
  onMenuClick: () => void;
};

const quickCreateItems: MenuProps["items"] = [
  {
    key: "create-b2b-order",
    icon: <ShoppingCartOutlined />,
    label: "Tạo đơn B2B",
  },
  {
    key: "create-product",
    icon: <AppstoreAddOutlined />,
    label: "Tạo sản phẩm mới",
  },
  {
    key: "create-stock-receipt",
    icon: <InboxOutlined />,
    label: "Tạo phiếu nhập kho",
  },
  {
    key: "create-customer",
    icon: <UserAddOutlined />,
    label: "Thêm khách hàng",
  },
];

export default function AdminTopbar({ onMenuClick }: AdminTopbarProps) {
  return (
    <header
      className="admin-topbar"
    >
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

        <Dropdown
          menu={{ items: quickCreateItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="hidden sm:inline-flex"
          >
            <span className="inline-flex items-center gap-2">
              Tạo nhanh
              <DownOutlined className="text-[11px]" />
            </span>
          </Button>
        </Dropdown>

        <Dropdown
          menu={{ items: quickCreateItems }}
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

        <button
          type="button"
          aria-label="Tài khoản quản trị"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary-container text-sm font-bold text-on-primary shadow-sm"
        >
          A
        </button>
      </div>
    </header>
  );
}
