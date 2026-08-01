import type { Metadata } from "next";
import CategoryPage from "@/components/admin/products/CategoryPage";

export const metadata: Metadata = {
  title: "Quản lý danh mục - TeeStudio Quản trị",
  description: "Thêm, sửa, xóa danh mục sản phẩm phôi áo.",
};

export default function CategoryRoute() {
  return <CategoryPage />;
}
