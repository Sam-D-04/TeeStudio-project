"use client";

import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import OrdersPage from "@/components/admin/orders/OrdersPage";

/**
 * OrdersClient – Client component bao ngoài trang Quản lý đơn hàng.
 *
 * Đây là lớp "vỏ" chứa Layout (Sidebar + Topbar) giống với AdminDashboard.
 * Nó cần "use client" vì có state (mở/đóng menu mobile, kiểm tra màn hình).
 *
 * Nội dung thực tế của trang nằm trong <OrdersPage />.
 */
export default function OrdersClient() {
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

    // Chạy lần đầu khi component mount
    updateScreenSize();

    // Lắng nghe thay đổi kích thước màn hình
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
      {/* Sidebar bên trái */}
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

      {/* Vùng nội dung chính (dịch sang phải khi có sidebar) */}
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
            paddingTop: 88,       // Để tránh bị topbar 64px che
            paddingRight: isDesktop ? 24 : 16,
            paddingBottom: 48,
            paddingLeft: isDesktop ? 24 : 16,
          }}
        >
          {/* Nội dung trang Quản lý đơn hàng */}
          <OrdersPage />
        </main>
      </div>
    </div>
  );
}
