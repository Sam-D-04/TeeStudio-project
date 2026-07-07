"use client";

import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import StatisticsFilterBar from "./components/StatisticsFilterBar";
import StatisticsMetricCard from "./components/StatisticsMetricCard";
import {
  DistributionPanel,
  Panel,
  StatisticsTable,
} from "./components/StatisticsPanels";
import {
  orderStatusDistribution,
  paymentMethodRows,
  paymentStatusDistribution,
  productReportRows,
  ratioMetrics,
  reportMetrics,
} from "./mockData";

const productColumns = [
  { key: "product", label: "Sản phẩm" },
  { key: "orderLines", label: "Dòng đơn", align: "right" as const },
  { key: "quantity", label: "Số lượng", align: "right" as const },
  { key: "lineValue", label: "Tổng giá trị dòng đơn", align: "right" as const },
];

const paymentMethodColumns = [
  { key: "method", label: "Phương thức" },
  { key: "transactions", label: "Giao dịch", align: "right" as const },
  { key: "completed", label: "Thành công", align: "right" as const },
  { key: "collected", label: "Số tiền đã thu", align: "right" as const },
];

export default function StatisticsPage() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });

  const rangeLabel = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return "Đang xác định khoảng thời gian";
    return `${dayjs(dateRange.startDate).format("DD/MM/YYYY")} – ${dayjs(dateRange.endDate).format("DD/MM/YYYY")}`;
  }, [dateRange]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-container">
            <BarChartOutlined />
            <span>Báo cáo tổng hợp</span>
          </div>
          <h2 className="text-headline-lg-mobile font-extrabold text-text-main md:text-headline-lg">Thống kê</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-secondary">
            Tổng hợp dữ liệu theo khoảng thời gian để đối chiếu và lập báo cáo, không lặp lại các cảnh báo vận hành trên dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary lg:self-auto">
          <CalendarOutlined className="text-primary-container" />
          <span>{rangeLabel}</span>
        </div>
      </header>

      <StatisticsFilterBar
        onDateChange={(startDate, endDate) => setDateRange({ startDate, endDate })}
      />

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {reportMetrics.map((metric) => (
          <StatisticsMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section aria-labelledby="ratio-statistics-heading" className="space-y-3">
        <div>
          <h3 id="ratio-statistics-heading" className="text-card-title font-bold text-text-main">
            Các tỷ lệ trong kỳ
          </h3>
          <p className="mt-1 text-xs leading-5 text-text-secondary">
            Mũi tên thể hiện hướng quản trị mong muốn, không phải mức thay đổi so với kỳ trước.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {ratioMetrics.map((metric) => (
            <StatisticsMetricCard key={metric.label} metric={metric} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Panel
          title="Cơ cấu trạng thái đơn hàng"
          description="Nhóm và đếm CustomerOrder theo trạng thái hiện tại."
        >
          <DistributionPanel items={orderStatusDistribution} />
        </Panel>
        <Panel
          title="Cơ cấu trạng thái giao dịch"
          description="Nhóm và đếm Payment theo trạng thái giao dịch."
        >
          <DistributionPanel items={paymentStatusDistribution} />
        </Panel>
      </div>

      <Panel
        title="Báo cáo theo sản phẩm"
        description="Tổng hợp toàn bộ sản phẩm phát sinh trong OrderItem, không xếp hạng bán chạy và không tính đơn đã hủy."
      >
        <StatisticsTable columns={productColumns} rows={productReportRows} />
      </Panel>

      <Panel
        title="Báo cáo theo phương thức thanh toán"
        description="Đếm giao dịch và cộng Payment.amount thành công theo từng paymentMethod."
      >
        <StatisticsTable columns={paymentMethodColumns} rows={paymentMethodRows} />
      </Panel>

      <aside className="flex flex-col gap-3 rounded-[12px] border border-primary-fixed bg-sky-50/70 p-4 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-primary-container shadow-sm">
            <DatabaseOutlined />
          </span>
          <div>
            <p className="font-bold text-text-main">Statistics dành cho báo cáo, Dashboard dành cho vận hành</p>
            <p className="mt-0.5 text-xs leading-5">
              Dữ liệu minh họa khớp Database_main.sql; mô tả từng mục là công thức gợi ý để backend nối API.
            </p>
          </div>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-success">
          <CheckCircleOutlined /> Sẵn sàng tích hợp API
        </span>
      </aside>
    </div>
  );
}
