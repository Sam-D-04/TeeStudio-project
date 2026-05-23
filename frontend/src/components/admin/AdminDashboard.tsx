"use client";

import {
  BgColorsOutlined,
  CreditCardOutlined,
  InboxOutlined,
  RiseOutlined,
  ShoppingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import BestSellingProductsCard, {
  type BestSellingProduct,
} from "./BestSellingProductsCard";
import DashboardFilterToolbar from "./DashboardFilterToolbar";
import DesignReviewTable, { type DesignOrder } from "./DesignReviewTable";
import InventoryWarningCard from "./InventoryWarningCard";
import MetricCard from "./MetricCard";
import RevenueOverviewChart from "./RevenueOverviewChart";
import SegmentedTabs from "./SegmentedTabs";

const metrics = [
  {
    label: "Doanh thu",
    value: "18.450.000đ",
    icon: <RiseOutlined />,
    iconClassName: "text-success",
  },
  {
    label: "Đơn mới",
    value: "42",
    icon: <ShoppingOutlined />,
    iconClassName: "text-primary-container",
  },
  {
    label: "Thiết kế chờ duyệt",
    value: "9",
    icon: <BgColorsOutlined />,
    iconClassName: "text-warning",
  },
  {
    label: "Đang sản xuất",
    value: "17",
    icon: <ToolOutlined />,
    iconClassName: "text-accent",
  },
  {
    label: "Cảnh báo tồn kho",
    value: "23",
    icon: <InboxOutlined />,
    iconClassName: "text-error",
    valueClassName: "text-error",
  },
  {
    label: "Thanh toán cần đối soát",
    value: "6",
    icon: <CreditCardOutlined />,
    iconClassName: "text-tertiary",
  },
];

const reviewTabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "revision", label: "Cần sửa" },
  { key: "ready", label: "Sẵn sàng in" },
  { key: "urgent", label: "Gấp", danger: true },
];

const designOrders: DesignOrder[] = [
  {
    code: "DH-20260522-001",
    customerName: "Nguyễn Văn A",
    technique: "In PET",
    status: "pending",
  },
  {
    code: "DH-20260522-002",
    customerName: "Trần Thị B",
    technique: "In lụa",
    status: "revision",
  },
];

const inventoryItems = [
  {
    name: "Áo thun cotton 100%",
    detail: "Màu: Đen | Cỡ: M",
    quantity: 12,
  },
  {
    name: "Áo polo cổ điển",
    detail: "Màu: Trắng | Cỡ: L",
    quantity: 8,
  },
];

const bestSellingProducts: BestSellingProduct[] = [
  {
    name: "Áo thun cotton 100%",
    variant: "Đen / Cỡ M",
    revenue: "7.850.000đ",
    thumbnailClassName: "bg-sky-100 text-sky-700",
  },
  {
    name: "Áo polo cổ điển",
    variant: "Trắng / Cỡ L",
    revenue: "6.420.000đ",
    thumbnailClassName: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Áo nhóm",
    variant: "Xanh đậm / Cỡ XL",
    revenue: "5.980.000đ",
    thumbnailClassName: "bg-indigo-100 text-indigo-700",
  },
  {
    name: "Áo nỉ cơ bản",
    variant: "Xám / Cỡ L",
    revenue: "4.760.000đ",
    thumbnailClassName: "bg-slate-100 text-slate-700",
  },
  {
    name: "Áo sự kiện cao cấp",
    variant: "Đỏ đô / Cỡ M",
    revenue: "3.940.000đ",
    thumbnailClassName: "bg-rose-100 text-rose-700",
  },
];

export default function AdminDashboard() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const updateScreenSize = () => {
      setIsDesktop(mediaQuery.matches);
    };

    updateScreenSize();
    mediaQuery.addEventListener("change", updateScreenSize);

    return () => {
      mediaQuery.removeEventListener("change", updateScreenSize);
    };
  }, []);

  return (
    <div
      className="admin-dashboard-shell"
      style={{
        minHeight: "100vh",
        background: "#f6fafe",
        color: "#0f172a",
        fontFamily: "var(--font-inter), Arial, sans-serif",
        fontSize: 14,
        lineHeight: "20px",
      }}
    >
      <AdminSidebar
        isDesktop={isDesktop}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <AdminTopbar
        isDesktop={isDesktop}
        onMenuClick={() => setMobileSidebarOpen(true)}
      />

      <div
        className="admin-content-area"
        style={{
          width: "100%",
          minHeight: "100vh",
          paddingLeft: isDesktop ? 260 : 0,
        }}
      >
        <main
          className="admin-main"
          style={{
            width: "100%",
            maxWidth: 1600,
            marginLeft: "auto",
            marginRight: "auto",
            paddingTop: 88,
            paddingRight: isDesktop ? 24 : 16,
            paddingBottom: 48,
            paddingLeft: isDesktop ? 24 : 16,
          }}
        >
          <section className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-headline-lg-mobile font-extrabold leading-8 text-text-main md:text-headline-lg">
                Tổng quan vận hành
              </h2>
              <p className="mt-1 max-w-2xl text-text-secondary">
                Theo dõi số liệu doanh thu, đơn hàng, thiết kế, sản xuất và tồn kho theo thời gian.
              </p>
            </div>
          </section>

          <DashboardFilterToolbar />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {metrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                iconClassName={metric.iconClassName}
                valueClassName={metric.valueClassName}
              />
            ))}
          </section>

          <RevenueOverviewChart />

          <section className="admin-card overflow-hidden">
            <div className="flex flex-col gap-4 border-b border-border p-6 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-card-title font-bold text-text-main">
                Thiết kế cần xử lý
              </h3>
              <SegmentedTabs tabs={reviewTabs} activeKey="all" />
            </div>
            <DesignReviewTable orders={designOrders} />
          </section>

          <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InventoryWarningCard items={inventoryItems} />
            <BestSellingProductsCard products={bestSellingProducts} />
          </section>
        </main>
      </div>
    </div>
  );
}
