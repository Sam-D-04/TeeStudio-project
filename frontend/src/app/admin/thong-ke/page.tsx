import type { Metadata } from "next";
import StatisticsClient from "@/components/admin/statistics/StatisticsClient";

export const metadata: Metadata = {
  title: "Thống kê kinh doanh - TeeStudio Quản trị",
  description:
    "Phân tích doanh thu, đơn hàng, sản phẩm, thiết kế, khách hàng, thanh toán, khuyến mãi và kho hàng TeeStudio.",
};

export default function ThongKePage() {
  return <StatisticsClient />;
}
