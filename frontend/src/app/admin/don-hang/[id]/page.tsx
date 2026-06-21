import type { Metadata } from "next";
import OrderDetailRouteClient from "@/components/admin/orders/OrderDetailRouteClient";

export const metadata: Metadata = {
  title: "Chi tiết đơn hàng - TeeStudio Quản trị",
  description:
    "Trang chi tiết đơn hàng cho admin TeeStudio sau khi tạo hoặc mở từ danh sách đơn hàng.",
};

export default function AdminOrderDetailRoute() {
  return <OrderDetailRouteClient />;
}
