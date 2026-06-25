"use client";

import PromotionPage from "@/components/admin/promotions/PromotionPage";
import type { PromotionInitialFilters } from "@/components/admin/promotions/PromotionPage";

/**
 * PromotionClient – Client boundary cho trang Khuyến mãi & Báo giá.
 *
 * Tại sao cần file này?
 * - Next.js App Router yêu cầu mọi component dùng useState/useEffect
 *   phải có directive "use client" ở đầu file.
 * - File page.tsx trong /app là Server Component (mặc định) và
 *   chỉ chứa metadata SEO + gọi component này.
 * - PromotionPage.tsx dùng useState nên phải là Client Component.
 * - Tách riêng như vậy để layout.tsx (AdminShell) không bị ảnh hưởng,
 *   giữ đúng kiến trúc của toàn bộ admin module.
 */
type PromotionClientProps = {
  initialFilters?: PromotionInitialFilters;
};

export default function PromotionClient({ initialFilters }: PromotionClientProps) {
  return <PromotionPage initialFilters={initialFilters} />;
}
