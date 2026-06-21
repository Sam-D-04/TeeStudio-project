"use client";

/**
 * DesignClient – Wrapper client component cho trang Thiết kế & In ấn.
 *
 * Tại sao cần file này?
 *  - Trong Next.js App Router, file page.tsx là Server Component mặc định.
 *  - Trang này cần dùng React state (useState) và event handler → phải chạy ở client.
 *  - Giải pháp: page.tsx giữ nguyên là Server Component (để khai báo metadata SEO),
 *    còn toàn bộ logic client được bọc trong DesignClient.tsx này.
 *
 * Pattern này nhất quán với các module khác:
 *  - PromotionClient.tsx (Khuyến mãi & Báo giá)
 *  - SettingsClient.tsx (Cài đặt)
 *  - OrdersClient.tsx (Đơn hàng)
 */

import DesignPage from "./DesignPage";

export default function DesignClient() {
  // Chỉ render DesignPage – toàn bộ logic nằm trong đó
  // File này chỉ đóng vai trò "cầu nối" giữa Server Component (page.tsx)
  // và Client Component (DesignPage.tsx)
  return <DesignPage />;
}
