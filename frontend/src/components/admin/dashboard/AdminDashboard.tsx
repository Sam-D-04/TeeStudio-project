"use client";

import {
  AlertOutlined,
  InboxOutlined,
  PercentageOutlined,
  RiseOutlined,
  ScissorOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import * as dashboardService from "@/services/admin/dashboardService";
import type { DashboardGroupBy } from "@/services/admin/dashboardService";
import type { DesignOrder } from "./components/DesignReviewTable";
import BestSellingProductsCard from "./components/BestSellingProductsCard";
import DashboardFilterToolbar, {
  type DashboardDateRange,
} from "./components/DashboardFilterToolbar";
import DesignReviewTable from "./components/DesignReviewTable";
import InventoryWarningCard from "./components/InventoryWarningCard";
import MetricCard from "./components/MetricCard";
import RevenueOverviewChart from "./components/RevenueOverviewChart";

// ---------------------------------------------------------------------------
// Tiện ích định dạng
// ---------------------------------------------------------------------------

/** Định dạng số tiền VND có dấu chấm ngàn */
function formatTienVnd(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "—";
  return amount.toLocaleString("vi-VN") + "đ";
}

/** Định dạng phần trăm có 1 chữ số thập phân */
function formatPhanTram(value: number | undefined): string {
  if (value === undefined || value === null) return "—";
  return `${value.toFixed(1).replace(".", ",")}%`;
}

// ---------------------------------------------------------------------------
// Khoảng ngày mặc định: toàn bộ tháng hiện tại
// ---------------------------------------------------------------------------
function getDefaultRange(): DashboardDateRange {
  const today = dayjs();
  return [today.startOf("month"), today.endOf("month")];
}

function getChartGroupBy(dates: DashboardDateRange): DashboardGroupBy {
  const [startDate, endDate] = dates;

  if (!startDate || !endDate) return "day";
  if (startDate.isSame(endDate, "day")) return "hour";
  return endDate.diff(startDate, "day") > 60 ? "month" : "day";
}

// ---------------------------------------------------------------------------
// Component chính
// ---------------------------------------------------------------------------
export default function AdminDashboard() {
  const [dates, setDates] = useState<DashboardDateRange>(getDefaultRange);
  const tuNgay = dates[0]?.format("YYYY-MM-DD") ?? "";
  const denNgay = dates[1]?.format("YYYY-MM-DD") ?? "";
  const groupBy = getChartGroupBy(dates);

  // ── Truy vấn 1: Thẻ chỉ số tổng quan ──
  const {
    data: chiSo,
    isLoading: isLoadingChiSo,
  } = useQuery({
    queryKey: ["dashboard/tong-quan", tuNgay, denNgay],
    queryFn: () => dashboardService.layTongQuanChiSo(tuNgay, denNgay),
    staleTime: 60_000,
  });

  // ── Truy vấn 2: Biểu đồ doanh thu ──
  const {
    data: bieuDo,
    isLoading: isLoadingBieuDo,
    isError: isErrorBieuDo,
  } = useQuery({
    queryKey: ["dashboard/bieu-do", tuNgay, denNgay, groupBy],
    queryFn: () => dashboardService.layDuLieuBieuDo(tuNgay, denNgay),
    staleTime: 60_000,
  });

  // ── Truy vấn 3: Thiết kế cần xử lý ──
  const {
    data: thietKeRaw,
    isLoading: isLoadingThietKe,
  } = useQuery({
    queryKey: ["dashboard/thiet-ke-can-xu-ly"],
    queryFn: () => dashboardService.layThietKeCanXuLy(),
    staleTime: 30_000,
  });

  // ── Truy vấn 4: Tồn kho cảnh báo ──
  const {
    data: tonKhoRaw,
    isLoading: isLoadingTonKho,
  } = useQuery({
    queryKey: ["dashboard/ton-kho-canh-bao"],
    queryFn: () => dashboardService.layTonKhoCanhBao(15, 10),
    staleTime: 120_000,
  });

  // ── Truy vấn 5: Sản phẩm bán chạy ──
  const {
    data: sanPhamBanChayRaw,
    isLoading: isLoadingSanPham,
  } = useQuery({
    queryKey: ["dashboard/san-pham-ban-chay", tuNgay, denNgay],
    queryFn: () => dashboardService.laySanPhamBanChay(tuNgay, denNgay, 3),
    staleTime: 60_000,
  });

  // ── Chuẩn hóa dữ liệu thiết kế sang type DesignOrder ──
  const designOrders: DesignOrder[] = (thietKeRaw ?? []).map((d) => ({
    designId: d.designId,
    code: d.code,
    customerName: d.customerName,
    technique: d.technique,
    status: d.status,
    isUrgent: d.isUrgent,
  }));

  // ── Chuẩn hóa dữ liệu tồn kho ──
  const inventoryItems = (tonKhoRaw ?? []).map((item) => ({
    variantId: item.variantId,
    name: item.name,
    detail: item.detail,
    quantity: item.quantity,
  }));

  // ── Chuẩn hóa dữ liệu sản phẩm bán chạy ──
  const bestSellingProducts = (sanPhamBanChayRaw ?? []).map((sp) => ({
    productId: sp.productId,
    name: sp.name,
    variant: sp.variant,
    revenue: sp.revenue,
    soldQty: sp.soldQty,
    thumbnailClassName: sp.thumbnailClassName,
  }));

  // ── Cấu hình thẻ chỉ số hàng 1 ──
  const primaryMetrics = [
    {
      label: "Doanh thu tháng này",
      value: isLoadingChiSo ? "..." : formatTienVnd(chiSo?.doanhThuThangVnd),
      icon: <RiseOutlined />,
      iconClassName: "text-success",
    },
    {
      label: "Doanh thu từ thiết kế",
      value: isLoadingChiSo ? "..." : formatTienVnd(chiSo?.doanhThuThietKeVnd),
      icon: <ScissorOutlined />,
      iconClassName: "text-accent",
    },
    {
      label: "Đơn hàng mới",
      value: isLoadingChiSo ? "..." : String(chiSo?.soDonMoi ?? "—"),
      icon: <ShoppingOutlined />,
      iconClassName: "text-primary-container",
    },
    {
      label: "Tồn kho mức thấp",
      value: isLoadingChiSo ? "..." : String(chiSo?.soVariantTonKhoThap ?? "—"),
      icon: <InboxOutlined />,
      iconClassName: "text-error",
      valueClassName: "text-error",
    },
  ];

  // ── Cấu hình thẻ chỉ số hàng 2 (cột trái) ──
  const operationMetrics = [
    {
      label: "Giá trị trung bình đơn",
      value: isLoadingChiSo ? "..." : formatTienVnd(chiSo?.giaTriTrungBinhDonVnd),
      icon: <PercentageOutlined />,
      iconClassName: "text-primary-container",
    },
    {
      label: "Tỷ lệ đơn hàng thành công",
      value: isLoadingChiSo ? "..." : formatPhanTram(chiSo?.tyLeThanhCongPhanTram),
      icon: <RiseOutlined />,
      iconClassName: "text-success",
      valueClassName: "text-success",
    },
    {
      label: "Doanh thu khác / Đền bù",
      value: isLoadingChiSo ? "..." : formatTienVnd(chiSo?.doanhThuKhacDenBuVnd),
      icon: <AlertOutlined />,
      iconClassName: "text-warning",
      subLabel: "Tỷ lệ hủy",
      subValue: isLoadingChiSo ? "..." : formatPhanTram(chiSo?.tyLeHuyPhanTram),
      subValueClassName: "text-error",
    },
  ];

  return (
    <>
      {/* Tiêu đề trang */}
      <section className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-headline-lg-mobile font-extrabold leading-8 text-text-main md:text-headline-lg">
            Tổng quan vận hành
          </h2>
          <span className="text-sm text-text-secondary">
            (Theo dõi doanh thu, đơn hàng, thiết kế và tồn kho theo thời gian thực.)
          </span>
        </div>
      </section>

      {/* Bộ lọc thời gian */}
      <DashboardFilterToolbar dates={dates} onDatesChange={setDates} />

      {/* ── Hàng 1: Thẻ chỉ số tài chính & đơn hàng (4 thẻ chính) ── */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* ── Hàng 2: 3 thẻ chỉ số (1/4 bên trái, xếp dọc) + Biểu đồ (3/4 bên phải) ── */}
      <section className="grid grid-cols-1 items-stretch gap-3 lg:grid-cols-[1fr_3fr]">
        {/* Cột trái: 3 thẻ xếp dọc */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-1">
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
        </div>
        {/* Cột phải: Biểu đồ doanh thu tổng quan */}
        <RevenueOverviewChart
          data={bieuDo?.danhSach ?? []}
          groupBy={bieuDo?.groupBy ?? groupBy}
          dateRange={bieuDo?.khoangThoiGian}
          isLoading={isLoadingBieuDo}
          isError={isErrorBieuDo}
        />
      </section>

      {/* ── Bảng thiết kế cần xử lý (To-do list) ── */}
      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-card-title font-bold text-text-main">
              Thiết kế cần xử lý
            </h3>
            <p className="mt-0.5 text-xs text-text-secondary">
              {isLoadingThietKe
                ? "Đang tải..."
                : `Hiển thị ${designOrders.length} thiết kế · Lọc: Chờ duyệt, Cần sửa`}
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

      {/* ── Tồn kho & 3 Sản phẩm bán chạy nhất ── */}
      <section className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
        <InventoryWarningCard items={inventoryItems} />
        <BestSellingProductsCard products={bestSellingProducts} />
      </section>
    </>
  );
}
