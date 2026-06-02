import type { Metadata } from "next";
import PaymentClient from "@/components/admin/payment/PaymentClient";

// Metadata SEO cho trang thanh toán (Server Component)
export const metadata: Metadata = {
  title: "Quản lý thanh toán - TeeStudio Quản trị",
  description:
    "Theo dõi giao dịch VNPAY, COD, đối soát doanh thu, xử lý lỗi thanh toán và hoàn tiền.",
};

/**
 * ThanhToanPage – Server Component cho route /admin/thanh-toan.
 *
 * Nhiệm vụ duy nhất: render PaymentClient (Client Component) để
 * trang được bọc trong AdminShell (sidebar + topbar) từ layout.tsx.
 */
export default function ThanhToanPage() {
  return <PaymentClient />;
}
