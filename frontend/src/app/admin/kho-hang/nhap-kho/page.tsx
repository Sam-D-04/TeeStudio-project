import type { Metadata } from "next";
import NhapKhoClient from "@/components/admin/inventory/NhapKhoClient";

/**
 * Trang Nhập kho phôi áo – Admin.
 *
 * Đây là Server Component (Next.js App Router).
 * Khai báo metadata (title, description) cho SEO.
 * Nội dung và logic tương tác nằm trong NhapKhoClient / NhapKhoPage.
 */

// Metadata SEO cho trang nhập kho
export const metadata: Metadata = {
  title: "Nhập kho phôi áo - TeeStudio Quản trị",
  description:
    "Ghi nhận lô hàng nhập kho mới. Chọn sản phẩm, biến thể (màu/size) và số lượng để cập nhật tồn kho phôi áo.",
};

export default function NhapKhoRoute() {
  return <NhapKhoClient />;
}
