"use client";

import {
  AlertOutlined,
  InboxOutlined,
  PercentageOutlined,
  RiseOutlined,
  ScissorOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import BestSellingProductsCard, {
  type BestSellingProduct,
} from "./components/BestSellingProductsCard";
import DashboardFilterToolbar from "./components/DashboardFilterToolbar";
import DesignReviewTable, { type DesignOrder } from "./components/DesignReviewTable";
import InventoryWarningCard from "./components/InventoryWarningCard";
import MetricCard from "./components/MetricCard";
import RevenueOverviewChart from "./components/RevenueOverviewChart";

// ---------------------------------------------------------------------------
// Dữ liệu mẫu — Thẻ thống kê (hàng 1: chỉ số tài chính & đơn hàng)
// ---------------------------------------------------------------------------
const primaryMetrics = [
  {
    label: "Doanh thu tháng này",
    value: "18.450.000đ",
    icon: <RiseOutlined />,
    iconClassName: "text-success",
  },
  {
    label: "Giá trị trung bình đơn",
    value: "439.286đ",
    icon: <PercentageOutlined />,
    iconClassName: "text-primary-container",
  },
  {
    label: "Doanh thu từ thiết kế",
    value: "6.820.000đ",
    icon: <ScissorOutlined />,
    iconClassName: "text-accent",
  },
  {
    label: "Đơn hàng mới",
    value: "42",
    icon: <ShoppingOutlined />,
    iconClassName: "text-primary-container",
  },
  {
    label: "Tồn kho mức thấp",
    value: "23",
    icon: <InboxOutlined />,
    iconClassName: "text-error",
    valueClassName: "text-error",
  },
];

// ---------------------------------------------------------------------------
// Thẻ thống kê — hàng 2: chỉ số sức khỏe vận hành (nhỏ hơn, vai phụ)
// ---------------------------------------------------------------------------
const operationMetrics = [
  {
    label: "Tỷ lệ đơn hàng thành công",
    value: "94,3%",
    icon: <RiseOutlined />,
    iconClassName: "text-success",
    valueClassName: "text-success",
  },
  {
    label: "Doanh thu khác / Đền bù",
    value: "1.200.000đ",
    icon: <AlertOutlined />,
    iconClassName: "text-warning",
    subLabel: "Tỷ lệ hủy",
    subValue: "5,7%",
    subValueClassName: "text-error",
  },
];

// ---------------------------------------------------------------------------
// Dữ liệu mẫu — Bảng thiết kế cần xử lý
// ---------------------------------------------------------------------------
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
  {
    code: "DH-20260523-007",
    customerName: "Lê Minh C",
    technique: "In DTG",
    status: "pending",
    isUrgent: true,
  },
  {
    code: "DH-20260523-010",
    customerName: "Phạm Thu D",
    technique: "In PET",
    status: "revision",
  },
  {
    code: "DH-20260523-015",
    customerName: "Hoàng Văn E",
    technique: "In lụa",
    status: "pending",
    isUrgent: true,
  },
];

// ---------------------------------------------------------------------------
// Dữ liệu mẫu — Tồn kho & sản phẩm bán chạy
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Component chính
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  return (
    <>
      {/* Tiêu đề trang */}
      <section className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-headline-lg-mobile font-extrabold leading-8 text-text-main md:text-headline-lg">
            Tổng quan vận hành
          </h2>
          <p className="mt-0.5 max-w-2xl text-sm text-text-secondary">
            Theo dõi doanh thu, đơn hàng, thiết kế và tồn kho theo thời gian thực.
          </p>
        </div>
      </section>

      {/* Bộ lọc thời gian */}
      <DashboardFilterToolbar />

      {/* ── Hàng 1: Thẻ chỉ số tài chính & đơn hàng (5 thẻ chính) ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {primaryMetrics.map((metric) => (
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

      {/* ── Hàng 2: Thẻ chỉ số sức khỏe vận hành (2 thẻ nhỏ + biểu đồ) ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_2fr]">
        {operationMetrics.map((metric) => (
          <MetricCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            icon={metric.icon}
            iconClassName={metric.iconClassName}
            valueClassName={metric.valueClassName}
            subLabel={metric.subLabel}
            subValue={metric.subValue}
            subValueClassName={metric.subValueClassName}
          />
        ))}
        {/* Biểu đồ doanh thu tổng quan — chiều cao ngắn gọn */}
        <RevenueOverviewChart />
      </section>

      {/* ── Bảng thiết kế cần xử lý (To-do list) ── */}
      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-card-title font-bold text-text-main">
              Thiết kế cần xử lý
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              Hiển thị tối đa 5 thiết kế &nbsp;·&nbsp; Lọc: Chờ duyệt, Cần sửa, Gấp
            </p>
          </div>
          <a
            href="#"
            className="shrink-0 text-sm font-medium text-primary-container hover:underline"
          >
            Xem tất cả thiết kế →
          </a>
        </div>
        <DesignReviewTable orders={designOrders} />
      </section>

      {/* ── Tồn kho & Sản phẩm bán chạy ── */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <InventoryWarningCard items={inventoryItems} />
        <BestSellingProductsCard products={bestSellingProducts} />
      </section>
    </>
  );
}
