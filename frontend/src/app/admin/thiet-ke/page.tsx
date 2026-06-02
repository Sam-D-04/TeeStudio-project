import type { Metadata } from "next";
import AdminPlaceholderPage from "@/components/admin/common/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Quản lý thiết kế - TeeStudio Quản trị",
  description: "Theo dõi và duyệt các thiết kế in áo trong hệ thống TeeStudio.",
};

export default function ThietKePage() {
  return (
    <AdminPlaceholderPage
      title="Quản lý thiết kế"
      description="Theo dõi hàng chờ duyệt thiết kế, file in và các yêu cầu chỉnh sửa trước khi chuyển sang sản xuất."
    />
  );
}
