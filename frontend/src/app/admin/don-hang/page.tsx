import type { Metadata } from "next";
import OrdersClient from "@/components/admin/orders/OrdersClient";

/**
 * Metadata SEO cho trang Quản lý đơn hàng.
 * Next.js tự động đặt <title> và <meta description> vào <head>.
 */
export const metadata: Metadata = {
  title: "Quản lý đơn hàng – TeeStudio Quản trị",
  description:
    "Theo dõi và xử lý đơn hàng áo tùy chỉnh: trạng thái sản xuất, thanh toán, giao hàng.",
};

/**
 * Trang Quản lý đơn hàng.
 * Route: /admin/don-hang
 *
 * Đây là Server Component (không có "use client") nên chỉ chứa
 * metadata và render component con. Logic tương tác nằm trong OrdersClient.
 */
export default function AdminOrdersPage() {
  return <OrdersClient />;
}
