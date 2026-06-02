/**
 * page.tsx – Route Next.js App Router cho trang Quản lý Phôi Áo
 * Đường dẫn: /admin/san-pham-phoi-ao
 *
 * Đây là Server Component (mặc định trong App Router).
 * Nội dung thực tế được render bởi ProductsClient (client component)
 * để cho phép sử dụng useState, event handlers...
 *
 * Layout (sidebar + topbar) được cung cấp bởi AdminShell qua
 * file frontend/src/app/admin/layout.tsx → không cần khai báo lại ở đây.
 */

import type { Metadata } from "next";
import ProductsClient from "@/components/admin/products/ProductsClient";

// SEO: tiêu đề trang hiển thị trên tab trình duyệt
export const metadata: Metadata = {
  title: "Sản phẩm / Phôi áo – TeeStudio Quản trị",
  description:
    "Quản lý danh mục phôi áo, biến thể màu và size, giá nền và tồn kho cho hệ thống in áo tự thiết kế TeeStudio.",
};

export default function ProductsAdminPage() {
  return <ProductsClient />;
}
