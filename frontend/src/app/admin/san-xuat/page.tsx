import type { Metadata } from "next";
import AdminPlaceholderPage from "@/components/admin/common/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý sản xuất - TeeStudio Quản trị",
  description: "Theo dõi tiến độ sản xuất, in áo và bàn giao đơn hàng TeeStudio.",
};

export default function SanXuatPage() {
  return (
    <AdminPlaceholderPage
      title="Quản lý sản xuất"
      description="Theo dõi trạng thái xuất phôi, in áo, kiểm tra chất lượng và bàn giao cho vận chuyển."
    />
  );
}
