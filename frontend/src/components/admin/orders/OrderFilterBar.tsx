import type { OrderStatus } from "./OrderStatusBadge";

/**
 * OrderFilterBar – thanh lọc đơn hàng.
 *
 * Gồm hai phần:
 * 1. Hàng pill (nút bo tròn) để lọc theo trạng thái xử lý.
 * 2. Hàng select để lọc theo thanh toán, thời gian, loại đơn.
 */

// Danh sách các tab lọc trạng thái (pill)
export type FilterTab = {
  key: OrderStatus | "tat_ca" | "dang_xu_ly_in"; // "tat_ca" = Tất cả
  label: string;
};

const FILTER_TABS: FilterTab[] = [
  { key: "tat_ca",        label: "Tất cả" },
  { key: "cho_xac_nhan",  label: "Chờ xác nhận" },
  { key: "da_xac_nhan",   label: "Đã xác nhận" },
  { key: "dang_xu_ly_in", label: "Đang xử lý in" },
  { key: "cho_giao",      label: "Chờ giao" },
  { key: "dang_giao",     label: "Đang giao" },
  { key: "hoan_tat",      label: "Hoàn tất" },
];

type OrderFilterBarProps = {
  // Tab đang được chọn (trạng thái hoặc "tat_ca")
  activeTab: string;
  // Hàm gọi lại khi người dùng chọn tab khác
  onTabChange: (key: string) => void;

  // Giá trị các select box
  paymentFilter: string;
  onPaymentFilterChange: (value: string) => void;

  timeFilter: string;
  onTimeFilterChange: (value: string) => void;

  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
};

export default function OrderFilterBar({
  activeTab,
  onTabChange,
  paymentFilter,
  onPaymentFilterChange,
  timeFilter,
  onTimeFilterChange,
  typeFilter,
  onTypeFilterChange,
}: OrderFilterBarProps) {
  return (
    // Khu vực filter: nền xám nhạt, viền dưới, padding 16px
    <div className="space-y-4 border-b border-border bg-surface-alt px-4 py-4">

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
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${activeClass}`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ---- Hàng 2: Các select box lọc nâng cao ---- */}
      <div className="flex flex-wrap items-center gap-3">

        {/* Select lọc theo thanh toán */}
        <div className="relative">
          <select
            value={paymentFilter}
            onChange={(e) => onPaymentFilterChange(e.target.value)}
            className="h-control-h appearance-none rounded-lg border border-border bg-surface pl-4 pr-10 text-sm text-text-main outline-none focus:border-primary-container"
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

        {/* Select lọc theo thời gian */}
        <div className="relative">
          <select
            value={timeFilter}
            onChange={(e) => onTimeFilterChange(e.target.value)}
            className="h-control-h appearance-none rounded-lg border border-border bg-surface pl-4 pr-10 text-sm text-text-main outline-none focus:border-primary-container"
          >
            <option value="tat_ca">Tất cả thời gian</option>
            <option value="hom_nay">Hôm nay</option>
            <option value="tuan_nay">Tuần này</option>
            <option value="thang_nay">Tháng này</option>
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary">
            ▾
          </span>
        </div>

        {/* Select lọc theo loại đơn */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="h-control-h appearance-none rounded-lg border border-border bg-surface pl-4 pr-10 text-sm text-text-main outline-none focus:border-primary-container"
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
