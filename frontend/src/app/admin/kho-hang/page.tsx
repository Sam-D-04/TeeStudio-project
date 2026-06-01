import type { Metadata } from "next";
import InventoryClient from "@/components/admin/inventory/InventoryClient";

/**
 * Trang Quản lý Kho hàng – Admin.
 *
 * Đây là Server Component (Next.js App Router).
 * Server Component không cần "use client" và được render trước trên server.
 * Lợi ích:
 * - Khai báo metadata (title, description) cho SEO.
 * - Giảm lượng JavaScript gửi về client.
 *
 * Toàn bộ layout (Sidebar + Topbar + nội dung) nằm trong InventoryClient,
 * giống với cấu trúc của trang Đơn hàng (OrdersClient).
 */

// Metadata SEO cho trang quản lý kho hàng
export const metadata: Metadata = {
  title: "Quản lý kho phôi áo - TeeStudio Quản trị",
  description:
    "Theo dõi tồn kho áo trơn theo màu, size và SKU. Quản lý nhập xuất phôi áo trước khi chuyển sang xưởng in.",
};

export default function KhoHangPage() {
  // InventoryClient đã bao gồm Sidebar + Topbar + InventoryPage bên trong
  return <InventoryClient />;
}
