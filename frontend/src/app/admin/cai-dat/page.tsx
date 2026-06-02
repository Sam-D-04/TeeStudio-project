import type { Metadata } from "next";
import AdminPlaceholderPage from "@/components/admin/common/AdminPlaceholderPage";

export const metadata: Metadata = {
  title: "Cài đặt quản trị - TeeStudio Quản trị",
  description: "Cấu hình hệ thống, tài khoản quản trị và quy trình vận hành TeeStudio.",
};

export default function CaiDatPage() {
  return (
    <AdminPlaceholderPage
      title="Cài đặt quản trị"
      description="Quản lý cấu hình hệ thống, tài khoản nội bộ, quyền truy cập và các thiết lập vận hành."
    />
  );
}
