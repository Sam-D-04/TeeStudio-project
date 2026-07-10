"use client";

import {
  BarChartOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  InboxOutlined,
  LineChartOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import * as statisticsService from "@/services/admin/statisticsService";
import StatisticsFilterBar from "./components/StatisticsFilterBar";
import StatisticsMetricCard, {
  StatisticsMetricCardSkeleton,
} from "./components/StatisticsMetricCard";
import {
  DistributionPanel,
  Panel,
  RevenueChartPanel,
  StatisticsTable,
} from "./components/StatisticsPanels";
import type { ChartDataItem, MetricItem, StatisticsTableRow } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Hằng số
// ─────────────────────────────────────────────────────────────────────────────

const STALE_TIME = 3 * 60 * 1000; // 3 phút

const productColumns = [
  { key: "product", label: "Sản phẩm" },
  { key: "bienThe", label: "Biến thể phổ biến" },
  { key: "quantity", label: "Đã bán", align: "right" as const },
  { key: "revenue", label: "Doanh thu", align: "right" as const },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tiện ích định dạng
// ─────────────────────────────────────────────────────────────────────────────

/** Định dạng tiền VNĐ: 1.250.000 → "1,25 triệu đ" hoặc "1.250.000đ" */
function formatTien(n: number): string {
  if (n >= 1_000_000_000)
    return `${(n / 1_000_000_000).toFixed(2).replace(/\.?0+$/, "")} tỷ đ`;
  if (n >= 1_000_000)
    return `${(n / 1_000_000).toFixed(2).replace(/\.?0+$/, "")} triệu đ`;
  return n.toLocaleString("vi-VN") + "đ";
}

/** Định dạng giá trị biểu đồ ngắn gọn */
function formatBieuDo(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

/** Định dạng nhãn % so kỳ trước */
function formatPct(pct: number): string | undefined {
  if (pct === 0) return undefined;
  return `${pct > 0 ? "+" : ""}${pct.toFixed(1)}% so với kỳ trước`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component lỗi nhỏ gọn
// ─────────────────────────────────────────────────────────────────────────────

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
      <ExclamationCircleOutlined />
      <span>{message}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatisticsPage
// ─────────────────────────────────────────────────────────────────────────────

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  // Chuyển chuỗi rỗng sang undefined để backend dùng giá trị mặc định
  const tuNgay = dateRange.startDate || undefined;
  const denNgay = dateRange.endDate || undefined;

  // ── 4 query song song ──────────────────────────────────────────────────────
  const {
    data: chiSo,
    isLoading: loadingChiSo,
    isError: errorChiSo,
  } = useQuery({
    queryKey: ["statistics/chi-so", tuNgay, denNgay],
    queryFn: () => statisticsService.layChiSo(tuNgay, denNgay),
    staleTime: STALE_TIME,
  });

  const {
    data: bieuDo,
    isLoading: loadingBieuDo,
    isError: errorBieuDo,
  } = useQuery({
    queryKey: ["statistics/bieu-do", tuNgay, denNgay],
    queryFn: () => statisticsService.layBieuDo(tuNgay, denNgay),
    staleTime: STALE_TIME,
  });

  const {
    data: topSanPham,
    isLoading: loadingTop,
    isError: errorTop,
  } = useQuery({
    queryKey: ["statistics/top-san-pham", tuNgay, denNgay],
    queryFn: () => statisticsService.layTopSanPham(tuNgay, denNgay, 5),
    staleTime: STALE_TIME,
  });

  const {
    data: phanBo,
    isLoading: loadingPhanBo,
    isError: errorPhanBo,
  } = useQuery({
    queryKey: ["statistics/phan-bo", tuNgay, denNgay],
    queryFn: () => statisticsService.layPhanBoTrangThai(tuNgay, denNgay),
    staleTime: STALE_TIME,
  });

  // ── Nhãn khoảng thời gian ─────────────────────────────────────────────────
  const rangeLabel = useMemo(() => {
    const start = chiSo?.khoangThoiGian?.tuNgay ?? dateRange.startDate;
    const end = chiSo?.khoangThoiGian?.denNgay ?? dateRange.endDate;
    if (!start || !end) return "Đang xác định khoảng thời gian";
    return `${dayjs(start).format("DD/MM/YYYY")} – ${dayjs(end).format("DD/MM/YYYY")}`;
  }, [chiSo, dateRange]);

  // ── Xây dựng MetricItem từ dữ liệu API ───────────────────────────────────
  const reportMetrics: MetricItem[] = useMemo(() => {
    if (!chiSo) return [];
    const { soSanhKyTruoc: ss } = chiSo;

    const pctDir = (pct: number): "up" | "down" | undefined =>
      pct > 0 ? "up" : pct < 0 ? "down" : undefined;

    return [
      {
        label: "Doanh thu",
        value: formatTien(chiSo.doanhThuVnd),
        description: "Tổng doanh thu từ đơn đã hoàn tất",
        icon: <DollarOutlined />,
        tone: "primary",
        direction: pctDir(ss.doanhThuPhanTram),
        directionLabel: formatPct(ss.doanhThuPhanTram),
      },
      {
        label: "Số đơn hàng",
        value: chiSo.soDonHang.toLocaleString("vi-VN"),
        description: "Tổng số đơn hàng phát sinh trong kỳ",
        icon: <ShoppingCartOutlined />,
        tone: "success",
        direction: pctDir(ss.soDonPhanTram),
        directionLabel: formatPct(ss.soDonPhanTram),
      },
      {
        label: "Sản phẩm bán ra",
        value: chiSo.soSanPhamBanRa.toLocaleString("vi-VN"),
        description: "Tổng số lượng áo từ đơn đã hoàn tất",
        icon: <InboxOutlined />,
        tone: "accent",
        direction: pctDir(ss.soSanPhamPhanTram),
        directionLabel: formatPct(ss.soSanPhamPhanTram),
      },
      {
        label: "Giá trị trung bình đơn",
        value: formatTien(chiSo.giaTriTrungBinhDonVnd),
        description: "Doanh thu ÷ Số đơn hoàn tất",
        icon: <LineChartOutlined />,
        tone: "warning",
        direction: pctDir(ss.giaTriTBDonPhanTram),
        directionLabel: formatPct(ss.giaTriTBDonPhanTram),
      },
    ];
  }, [chiSo]);

  // ── Xây dựng dữ liệu biểu đồ ─────────────────────────────────────────────
  const chartData: ChartDataItem[] = useMemo(
    () =>
      (bieuDo?.danhSach ?? []).map((d) => ({
        label: d.nhan,
        value: d.doanhThuVnd,
        displayValue: formatBieuDo(d.doanhThuVnd),
      })),
    [bieuDo]
  );

  // ── Xây dựng bảng top sản phẩm ───────────────────────────────────────────
  const productRows: StatisticsTableRow[] = useMemo(
    () =>
      (topSanPham ?? []).map((sp) => ({
        id: String(sp.productId),
        product: (
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-surface-container">
              {sp.imageUrl ? (
                <img
                  src={sp.imageUrl}
                  alt={sp.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-text-muted">
                  ÁO
                </span>
              )}
            </div>
            <p className="font-semibold text-text-main">{sp.name}</p>
          </div>
        ),
        bienThe: sp.bienThePhoBien,
        quantity: sp.tongSoLuong.toLocaleString("vi-VN"),
        revenue: formatTien(sp.tongDoanhThu),
      })),
    [topSanPham]
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Tiêu đề trang */}
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-container">
            <BarChartOutlined />
            <span>Kết quả hoạt động kinh doanh</span>
          </div>
          <h2 className="text-headline-lg-mobile font-extrabold text-text-main md:text-headline-lg">
            Theo dõi &amp; Thống kê
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            Tổng hợp dữ liệu doanh thu, đơn hàng và sản phẩm giúp ban quản trị nắm bắt chính
            xác tình hình kinh doanh của shop.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary lg:self-auto">
          <CalendarOutlined className="text-primary-container" />
          <span>{rangeLabel}</span>
        </div>
      </header>

      {/* Bộ lọc thời gian */}
      <StatisticsFilterBar
        onDateChange={(startDate, endDate) => setDateRange({ startDate, endDate })}
      />

      {/* 4 thẻ chỉ số */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loadingChiSo
          ? [1, 2, 3, 4].map((i) => <StatisticsMetricCardSkeleton key={i} />)
          : errorChiSo
            ? [1, 2, 3, 4].map((i) => (
                <article key={i} className="admin-card min-w-0 p-4 sm:p-5">
                  <InlineError message="Không thể tải chỉ số." />
                </article>
              ))
            : reportMetrics.map((metric) => (
                <StatisticsMetricCard key={metric.label} metric={metric} />
              ))}
      </section>

      {/* Biểu đồ doanh thu & Top sản phẩm */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Biểu đồ doanh thu"
          description="Biến động tổng doanh thu bán hàng theo thời gian."
        >
          {errorBieuDo ? (
            <div className="p-4">
              <InlineError message="Không thể tải dữ liệu biểu đồ." />
            </div>
          ) : (
            <RevenueChartPanel data={chartData} loading={loadingBieuDo} />
          )}
        </Panel>

        <Panel
          className="xl:col-span-1"
          title="Top sản phẩm bán chạy"
          description="Các sản phẩm mang lại doanh thu cao nhất trong kỳ."
        >
          {errorTop ? (
            <div className="p-4">
              <InlineError message="Không thể tải danh sách sản phẩm." />
            </div>
          ) : (
            <StatisticsTable
              columns={productColumns}
              rows={productRows}
              loading={loadingTop}
            />
          )}
        </Panel>
      </div>

      {/* Phân bổ trạng thái đơn hàng & thanh toán */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Tỷ lệ trạng thái đơn hàng"
          description="Phân bổ trạng thái của các đơn hàng phát sinh trong kỳ."
        >
          {errorPhanBo ? (
            <div className="p-4">
              <InlineError message="Không thể tải dữ liệu phân bổ." />
            </div>
          ) : (
            <DistributionPanel
              items={phanBo?.trangThaiDon ?? []}
              loading={loadingPhanBo}
            />
          )}
        </Panel>

        <Panel
          title="Tỷ lệ tình trạng thanh toán"
          description="Tình trạng nhận tiền từ các đơn hàng trong kỳ."
        >
          {errorPhanBo ? (
            <div className="p-4">
              <InlineError message="Không thể tải dữ liệu phân bổ." />
            </div>
          ) : (
            <DistributionPanel
              items={phanBo?.trangThaiThanhToan ?? []}
              loading={loadingPhanBo}
            />
          )}
        </Panel>
      </div>
    </div>
  );
}
