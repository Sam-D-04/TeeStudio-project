"use client";

import OrdersPage from "@/components/admin/orders/OrdersPage";

/**
 * OrdersClient – client boundary cho trang Quản lý đơn hàng.
 * Layout admin dùng chung nằm ở app/admin/layout.tsx.
 */
export default function OrdersClient() {
  return <OrdersPage />;
}
