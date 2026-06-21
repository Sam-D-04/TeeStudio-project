import type { Metadata } from "next";
import CreateOrderClient from "@/components/admin/orders/CreateOrderClient";

export const metadata: Metadata = {
  title: "Tạo đơn mới - TeeStudio Quản trị",
  description:
    "Form tạo đơn hàng mới cho admin TeeStudio: chọn khách hàng, địa chỉ, sản phẩm, thiết kế POD, thanh toán và khuyến mãi.",
};

export default function AdminCreateOrderRoute() {
  return <CreateOrderClient />;
}
