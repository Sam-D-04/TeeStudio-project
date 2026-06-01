"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import InventoryPage from "@/components/admin/inventory/InventoryPage";

/**
 * InventoryClient – Client component bao ngoài trang Quản lý Kho hàng.
 *
 * Có cùng cấu trúc với OrdersClient: bọc Sidebar + Topbar bên ngoài,
 * rồi render nội dung trang (InventoryPage) bên trong.
 *
 * Cần "use client" vì dùng useState và useEffect để:
 * - Theo dõi kích thước màn hình (desktop/mobile)
 * - Điều khiển đóng/mở sidebar trên di động
 */
export default function InventoryClient() {
  // State điều khiển việc mở/đóng sidebar trên di động
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // State kiểm tra có phải màn hình desktop không (>= 768px)
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Tạo media query để theo dõi kích thước màn hình
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    // Hàm cập nhật state khi màn hình thay đổi kích thước
    const updateScreenSize = () => {
      setIsDesktop(mediaQuery.matches);
    };

    // Chạy lần đầu khi component mount để xác định kích thước ban đầu
    updateScreenSize();

    // Lắng nghe thay đổi kích thước màn hình liên tục
    mediaQuery.addEventListener("change", updateScreenSize);

    // Dọn dẹp khi component unmount (tránh memory leak)
    return () => {
      mediaQuery.removeEventListener("change", updateScreenSize);
    };
  }, []);

  return (
    <div
      className="admin-dashboard-shell"
      style={{
        minHeight: "100vh",
        background: "#f6fafe",
        color: "#0f172a",
        fontFamily: "var(--font-inter), Arial, sans-serif",
        fontSize: 14,
        lineHeight: "20px",
      }}
    >
      {/* Sidebar bên trái – giống hoàn toàn với các trang admin khác */}
      <AdminSidebar
        isDesktop={isDesktop}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      {/* Thanh topbar cố định trên cùng */}
      <AdminTopbar
        isDesktop={isDesktop}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      {/* Vùng nội dung chính – dịch sang phải 260px khi có sidebar desktop */}
      <div
        className="admin-content-area"
        style={{
          width: "100%",
          minHeight: "100vh",
          paddingLeft: isDesktop ? 260 : 0,
        }}
      >
        <main
          className="admin-main"
          style={{
            width: "100%",
            maxWidth: 1600,
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: 64,        // Để tránh bị topbar 64px che, InventoryPage tự có padding 24px
            paddingRight: isDesktop ? 0 : 0,
            paddingBottom: 0,
            paddingLeft: isDesktop ? 0 : 0,
          }}
        >
          {/* Nội dung trang Quản lý Kho hàng */}
          <InventoryPage />
        </main>
      </div>
    </div>
  );
}
