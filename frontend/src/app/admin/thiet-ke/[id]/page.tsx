import type { Metadata } from "next";
import DesignDetailPage from "@/components/admin/designs/DesignDetailPage";

export const metadata: Metadata = {
  title: "Chi tiết thiết kế - TeeStudio Quản trị",
  description: "Xem thông tin chi tiết thiết kế khách hàng.",
};

export default function AdminDesignDetailRoute() {
  return <DesignDetailPage />;
}
