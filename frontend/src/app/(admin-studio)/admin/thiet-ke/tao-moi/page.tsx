import type { Metadata } from "next";
import AdminDesignStudio from "@/components/admin/designs/AdminDesignStudio";

export const metadata: Metadata = {
  title: "Tạo thiết kế cho khách - TeeStudio Quản trị",
};

export default function TaoThietKeChoKhachPage() {
  return <AdminDesignStudio />;
}
