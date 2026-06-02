import type { Metadata } from "next";
import AdminPlaceholderPage from "@/components/admin/common/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý thanh toán - TeeStudio Quản trị",
  description: "Theo dõi trạng thái thanh toán, đối soát và hoàn tiền TeeStudio.",
};

export default function ThanhToanPage() {
  return (
    <AdminPlaceholderPage
      title="Quản lý thanh toán"
      description="Theo dõi giao dịch VNPAY, COD, chuyển khoản, đối soát doanh thu và các trường hợp cần xử lý thủ công."
    />
  );
}
