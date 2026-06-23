import { CalendarOutlined } from "@ant-design/icons";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import type { ReactNode } from "react";
import type { Dayjs } from "dayjs";
import type { RangePickerProps } from "antd/es/date-picker";
import type { OrderStatus } from "./OrderStatusBadge";

const { RangePicker } = DatePicker;

/**
 * OrderFilterBar – thanh lọc đơn hàng.
 *
 * Gồm hai phần:
 * 1. Hàng pill (nút bo tròn) để lọc theo trạng thái xử lý.
 * 2. Hàng filter nâng cao để lọc theo thanh toán, thời gian, loại đơn.
 */

export type DateRange = [Dayjs, Dayjs];

function getWeekRange(): DateRange {
  const today = dayjs();
  const daysFromMonday = (today.day() + 6) % 7;

  return [today.subtract(daysFromMonday, "day"), today];
}

// Danh sách các tab lọc trạng thái (pill)
export type FilterTab = {
  key: OrderStatus | "tat_ca"; // "tat_ca" = Tất cả
  label: string;
};

const FILTER_TABS: FilterTab[] = [
  { key: "tat_ca",        label: "Tất cả" },
  { key: "cho_xac_nhan",  label: "Chờ xác nhận" },
  { key: "da_xac_nhan",   label: "Đã xác nhận" },
  { key: "dang_xu_ly_in", label: "Đang xử lý in" },
  { key: "cho_giao",      label: "Chờ giao" },
  { key: "dang_giao",     label: "Đang giao hàng" },
  { key: "hoan_tat",      label: "Hoàn tất" },
  { key: "da_huy",        label: "Đã hủy" },
];

type OrderFilterBarProps = {
  // Tab đang được chọn (trạng thái hoặc "tat_ca")
  activeTab: string;
  // Hàm gọi lại khi người dùng chọn tab khác
  onTabChange: (key: string) => void;

  // Giá trị các select box
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;

  dateRange: DateRange | null;
  onDateRangeChange: (value: DateRange | null) => void;

  typeFilter: string;
  onTypeFilterChange: (value: string) => void;

  searchSlot?: ReactNode;
};

export default function OrderFilterBar({
  activeTab,
  onTabChange,
  paymentFilter,
  onPaymentFilterChange,
  dateRange,
  onDateRangeChange,
  typeFilter,
  onTypeFilterChange,
  searchSlot,
}: OrderFilterBarProps) {
  const today = dayjs();
  const [weekStart, weekEnd] = getWeekRange();
  const rangePresets: RangePickerProps["presets"] = [
    { label: "Hôm nay", value: [today, today] as DateRange },
    { label: "Tuần này", value: [weekStart, weekEnd] as DateRange },
    { label: "Tháng này", value: [today.startOf("month"), today] as DateRange },
  ];

  const handleDateRangeChange: NonNullable<RangePickerProps["onChange"]> = (dates) => {
    if (dates?.[0] && dates[1]) {
      onDateRangeChange([dates[0], dates[1]]);
      return;
    }

    onDateRangeChange(null);
  };

  return (
    // Khu vực filter: nền xám nhạt, viền dưới, padding gọn
    <div className="space-y-3 border-b border-border bg-surface-alt px-4 py-3">

      {/* ---- Hàng 1: Các pill lọc trạng thái ---- */}
      <div className="flex flex-wrap gap-2">
        {FILTER_TABS.map((tab) => {
          // Pill đang được chọn: nền xanh nhạt, viền xanh, chữ xanh đậm
          // Pill chưa chọn: nền trắng, viền xám, chữ xám
          const isActive = activeTab === tab.key;
          const activeClass = isActive
            ? "bg-[#c9e6ff] text-[#004c6e] border-[#c9e6ff] font-bold"
            : "bg-surface text-text-secondary border-border hover:bg-surface-dim";

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${activeClass}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---- Hàng 2: Các select box lọc nâng cao ---- */}
      <div className="flex flex-wrap items-center gap-2">
        {searchSlot}

        {/* Select lọc theo thanh toán */}
        <div className="relative shrink-0">
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="h-control-h appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-text-main outline-none focus:border-primary-container"
          >
            <option value="tat_ca">Tất cả thanh toán</option>
            <option value="da_thanh_toan">Đã thanh toán</option>
            <option value="cho_thanh_toan">Chờ thanh toán</option>
          </select>
          {/* Icon mũi tên xuống */}
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            ▾
          </span>
        </div>

        {/* Lọc theo thời gian */}
        <div className="w-full shrink-0 sm:w-auto">
          <RangePicker
            aria-label="Chọn khoảng thời gian"
            value={dateRange}
            format="YYYY-MM-DD"
            presets={rangePresets}
            placeholder={["Từ ngày", "Đến ngày"]}
            separator="→"
            suffixIcon={<CalendarOutlined />}
            allowClear
            onChange={handleDateRangeChange}
            className="h-control-h w-full min-w-[240px] sm:w-[280px]"
          />
        </div>

        {/* Select lọc theo loại đơn */}
        <div className="relative shrink-0">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="h-control-h appearance-none rounded-lg border border-border bg-surface pl-3 pr-9 text-sm text-text-main outline-none focus:border-primary-container"
          >
            <option value="tat_ca">Loại đơn: Tất cả</option>
            <option value="custom_design">Thiết kế tùy chỉnh</option>
            <option value="ao_mau">Áo mẫu</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            ▾
          </span>
        </div>
      </div>
    </div>
  );
}
