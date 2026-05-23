import type { Metadata } from "next";
import AdminDashboardClient from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Tổng quan vận hành - TeeStudio Quản trị",
  description:
    "Trang quản trị theo dõi doanh thu, đơn hàng, thiết kế, sản xuất và tồn kho TeeStudio.",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}
