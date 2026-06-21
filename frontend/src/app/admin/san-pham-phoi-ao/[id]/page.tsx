import type { Metadata } from "next";
import EditProductRouteClient from "@/components/admin/products/EditProductRouteClient";

export const metadata: Metadata = {
  title: "Xem và sửa phôi áo - TeeStudio Quản trị",
  description:
    "Xem thông tin chi tiết, cập nhật thông tin và quản lý biến thể phôi áo.",
};

export default function EditProductRoute() {
  return <EditProductRouteClient />;
}
