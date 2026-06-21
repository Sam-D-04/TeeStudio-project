import type { Metadata } from "next";
import AddProductClient from "@/components/admin/products/AddProductClient";

export const metadata: Metadata = {
  title: "Thêm phôi áo mới - TeeStudio Quản trị",
  description:
    "Thêm thông tin phôi áo, các biến thể màu sắc, kích thước và tồn kho.",
};

export default function AddProductRoute() {
  return <AddProductClient />;
}
