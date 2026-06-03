"use client";

import PaymentPage from "@/components/admin/payment/PaymentPage";

/**
 * PaymentClient – client boundary cho trang Quản lý thanh toán.
 *
 * Tại sao cần file này?
 * - Next.js App Router yêu cầu mọi component dùng useState/useEffect
 *   phải có directive "use client" ở đầu file.
 * - File page.tsx trong /app là Server Component (mặc định) và
 *   chỉ chứa metadata + gọi component này.
 * - PaymentPage.tsx dùng useState nên phải là Client Component.
 * - Tách riêng như vậy để trang admin/layout.tsx (AdminShell) không bị
 *   ảnh hưởng, giữ đúng kiến trúc của toàn bộ admin module.
 */
export default function PaymentClient() {
  return <PaymentPage />;
}
