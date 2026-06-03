import type { Metadata } from "next";
import PromotionClient from "@/components/admin/promotions/PromotionClient";

// Metadata SEO cho trang – Server Component xử lý phần này
export const metadata: Metadata = {
  title: "Khuyến mãi & Báo giá - TeeStudio Quản trị",
  description:
    "Quản lý mã giảm giá, bảng giá số lượng lớn, phụ phí in ấn và công thức tính giá tự động cho hệ thống TeeStudio.",
};

/**
 * KhuyenMaiBaoGiaPage – Server Component cho route /admin/khuyen-mai-bao-gia.
 *
 * Nhiệm vụ duy nhất: khai báo metadata SEO và render PromotionClient.
 * Toàn bộ logic giao diện nằm trong PromotionClient → PromotionPage.
 *
 * Trang này được bọc tự động trong AdminShell (sidebar + topbar)
 * thông qua file /app/admin/layout.tsx.
 */
export default function KhuyenMaiBaoGiaPage() {
  return <PromotionClient />;
}
