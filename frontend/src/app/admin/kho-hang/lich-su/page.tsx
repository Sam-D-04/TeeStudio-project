import type { Metadata } from "next";
import LichSuKhoClient from "@/components/admin/inventory/LichSuKhoClient";

/**
 * Trang Lịch sử kho phôi áo – Admin.
 *
 * Đây là Server Component (Next.js App Router).
 * Khai báo metadata SEO. Nội dung và logic nằm trong LichSuKhoClient / LichSuKhoPage.
 */

export const metadata: Metadata = {
  title: "Lịch sử kho phôi áo - TeeStudio Quản trị",
  description:
    "Xem toàn bộ lịch sử giao dịch kho phôi áo: nhập kho, xuất kho, điều chỉnh tồn kho và hoàn trả.",
};

export default function LichSuKhoRoute() {
  return <LichSuKhoClient />;
}
