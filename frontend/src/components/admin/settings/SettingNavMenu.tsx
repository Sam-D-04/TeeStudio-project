/**
 * SettingNavMenu – Menu điều hướng bên trái của trang Cài đặt.
 *
 * Hiển thị danh sách các mục cài đặt để người dùng chuyển tab:
 * 1. Tài khoản & Phân quyền (mặc định active)
 * 2. Thông tin cửa hàng
 * 3. Trạng thái quy trình
 * 4. Phương thức thanh toán
 * 5. Bảo mật & Phiên đăng nhập
 * --- phân cách ---
 * 6. Đăng xuất (màu đỏ cảnh báo)
 *
 * Props:
 * - tabHienTai: key của tab đang chọn
 * - onDoiTab: callback khi người dùng chọn tab khác
 */

import type { ReactNode } from "react";
import {
  SafetyOutlined,       // icon "Tài khoản & Phân quyền" – hình khiên bảo vệ
  ShopOutlined,          // icon "Thông tin cửa hàng"
  ApartmentOutlined,     // icon "Trạng thái quy trình"
  WalletOutlined,        // icon "Phương thức thanh toán"
  LockOutlined,          // icon "Bảo mật & Phiên đăng nhập"
  LogoutOutlined,        // icon "Đăng xuất"
} from "@ant-design/icons";

// Định nghĩa các key tab hợp lệ
export type SettingTabKey =
  | "tai_khoan"
  | "thong_tin_cua_hang"
  | "trang_thai_quy_trinh"
  | "phuong_thuc_thanh_toan"
  | "bao_mat";

// Kiểu dữ liệu một mục menu
type MenuItem = {
  key: SettingTabKey;   // Định danh tab
  label: string;        // Nhãn hiển thị tiếng Việt
  icon: ReactNode;      // Icon Ant Design
};

// Danh sách các mục menu (trừ Đăng xuất vì có kiểu đặc biệt)
const MENU_ITEMS: MenuItem[] = [
  {
    key: "tai_khoan",
    label: "Tài khoản & Phân quyền",
    icon: <SafetyOutlined />,
  },
  {
    key: "thong_tin_cua_hang",
    label: "Thông tin cửa hàng",
    icon: <ShopOutlined />,
  },
  {
    key: "trang_thai_quy_trinh",
    label: "Trạng thái quy trình",
    icon: <ApartmentOutlined />,
  },
  {
    key: "phuong_thuc_thanh_toan",
    label: "Phương thức thanh toán",
    icon: <WalletOutlined />,
  },
  {
    key: "bao_mat",
    label: "Bảo mật & Phiên đăng nhập",
    icon: <LockOutlined />,
  },
];

type SettingNavMenuProps = {
  tabHienTai: SettingTabKey;          // Tab đang được chọn
  onDoiTab: (key: SettingTabKey) => void; // Callback khi đổi tab
};

export default function SettingNavMenu({ tabHienTai, onDoiTab }: SettingNavMenuProps) {
  return (
    // Card menu: nền trắng, bo góc 20px, sticky để không cuộn theo nội dung
    <div className="sticky top-[88px] rounded-[20px] border border-border bg-surface p-2 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <nav className="flex flex-col gap-1 text-sm">

        {/* ---- Các mục menu chính ---- */}
        {MENU_ITEMS.map((mucMenu) => {
          // Kiểm tra xem mục này có đang active không
          const dangActive = tabHienTai === mucMenu.key;

          return (
            <button
              key={mucMenu.key}
              type="button"
              onClick={() => onDoiTab(mucMenu.key)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors ${
                dangActive
                  // Mục active: nền xanh nhạt + chữ xanh đậm + đậm
                  ? "bg-[#e0f2fe] font-semibold text-[#0ea5e9]"
                  // Mục thường: chữ xám, hover nền xám nhạt
                  : "text-text-secondary hover:bg-[#f8fafc] hover:text-text-main"
              }`}
            >
              {/* Icon menu */}
              <span className="flex shrink-0 text-[20px] leading-none">
                {mucMenu.icon}
              </span>
              {/* Nhãn menu */}
              <span>{mucMenu.label}</span>
            </button>
          );
        })}

        {/* ---- Đường kẻ phân cách ---- */}
        <div className="my-2 mx-4 h-px bg-border" />

        {/* ---- Nút Đăng xuất – màu đỏ cảnh báo ---- */}
        <button
          type="button"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-left text-[#ea580c] transition-colors hover:bg-[#ffdad6]/50"
        >
          <span className="flex shrink-0 text-[20px] leading-none">
            <LogoutOutlined />
          </span>
          <span>Đăng xuất</span>
        </button>
      </nav>
    </div>
  );
}
