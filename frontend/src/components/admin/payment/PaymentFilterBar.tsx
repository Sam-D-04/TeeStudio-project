import type { PaymentStatus } from "./PaymentStatusBadge";

/**
 * PaymentFilterBar – thanh lọc giao dịch thanh toán.
 *
 * Gồm hai phần:
 * 1. Hàng input tìm kiếm + các select box (Trạng thái, Phương thức, Thời gian).
 * 2. Hàng pill nhanh để chuyển tab theo trạng thái (giống filter tab của đơn hàng).
 */

// Các tab trạng thái hiển thị dưới dạng pill (nút bo tròn)
type FilterPill = {
  key: PaymentStatus | "tat_ca"; // "tat_ca" = không lọc trạng thái
  label: string;
  pillClassName?: string; // Lớp CSS tùy chỉnh khi không active
};

const FILTER_PILLS: FilterPill[] = [
  { key: "tat_ca",        label: "Tất cả" },
  { key: "cho_thanh_toan", label: "Chờ thanh toán" },
  { key: "da_thanh_toan",  label: "Đã thanh toán" },
  {
    key: "that_bai",
    label: "Thất bại",
    // Pill màu đỏ nhạt khi không active
    pillClassName: "bg-[#fef2f2] border-[#fca5a5] text-[#b91c1c] hover:bg-[#fee2e2]",
  },

];

/** Số lượng giao dịch cho mỗi tab */
export type TabCounts = {
  tat_ca?: number;
  cho_thanh_toan?: number;
  da_thanh_toan?: number;
  that_bai?: number;
  can_doi_soat?: number;
};

type PaymentFilterBarProps = {
  // Tìm kiếm theo mã đơn / mã giao dịch
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Tab pill đang được chọn
  activeTab: string;
  onTabChange: (key: string) => void;

  // Các select box
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;

  methodFilter: string;
  onMethodFilterChange: (value: string) => void;

  timeFilter: string;
  onTimeFilterChange: (value: string) => void;

  // Nút lọc và đặt lại
  onFilter: () => void;
  onReset: () => void;

  // Số lượng cho mỗi tab pill (từ API)
  tabCounts?: TabCounts;
};

export default function PaymentFilterBar({
  searchValue,
  onSearchChange,
  activeTab,
  onTabChange,
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  timeFilter,
  onTimeFilterChange,
  onFilter,
  onReset,
  tabCounts,
}: PaymentFilterBarProps) {
  return (
    // Khung filter: nền trắng, bo góc 12px, viền 1px, shadow nhẹ
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

      {/* ---- Hàng 1: Input tìm kiếm + Select boxes + Nút lọc ---- */}
      <div className="flex flex-wrap items-end gap-3">

        {/* Ô tìm kiếm: tìm theo mã đơn hoặc mã giao dịch */}
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Tìm kiếm
          </label>
          {/* Wrapper để đặt icon search bên trong input */}
          <div className="relative">
            {/* Icon tìm kiếm bên trái */}
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Mã đơn / Mã GD..."
              className="h-control-h w-full rounded-lg border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-main outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* Select lọc theo trạng thái */}
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Trạng thái
          </label>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="h-control-h w-full appearance-none rounded-lg border border-border bg-surface-alt pl-3 pr-8 text-sm text-text-main outline-none focus:border-primary-container sm:w-36"
            >
              <option value="tat_ca">Tất cả</option>
              <option value="da_thanh_toan">Đã thanh toán</option>
              <option value="cho_thanh_toan">Chờ thanh toán</option>
              <option value="that_bai">Thất bại</option>
            </select>
            {/* Icon mũi tên xuống */}
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary">
              ▾
            </span>
          </div>
        </div>

        {/* Select lọc theo phương thức thanh toán */}
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Phương thức
          </label>
          <div className="relative">
            <select
              value={methodFilter}
              onChange={(e) => onMethodFilterChange(e.target.value)}
              className="h-control-h w-full appearance-none rounded-lg border border-border bg-surface-alt pl-3 pr-8 text-sm text-text-main outline-none focus:border-primary-container sm:w-32"
            >
              <option value="tat_ca">Tất cả</option>
              <option value="vnpay">VNPAY</option>
              <option value="cod">COD</option>
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary">
              ▾
            </span>
          </div>
        </div>

        {/* Ô chọn thời gian (dạng input text readonly, mở date picker sau) */}
        <div className="w-full sm:w-auto">
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Thời gian
          </label>
          <div className="relative">
            {/* Icon lịch */}
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={timeFilter}
              onChange={(e) => onTimeFilterChange(e.target.value)}
              placeholder="Hôm nay"
              readOnly
              className="h-control-h w-full cursor-pointer rounded-lg border border-border bg-surface-alt pl-9 pr-3 text-sm text-text-main outline-none focus:border-primary-container sm:w-40"
            />
          </div>
        </div>

        {/* Nút Lọc và Đặt lại */}
        <div className="flex w-full gap-2 sm:w-auto">
          {/* Nút Lọc – màu xanh chính */}
          <button
            type="button"
            onClick={onFilter}
            className="h-control-h flex-1 rounded-lg bg-[#0ea5e9] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0284c7] sm:flex-none"
          >
            Lọc
          </button>
          {/* Nút Đặt lại – màu xám phụ */}
          <button
            type="button"
            onClick={onReset}
            className="h-control-h flex-1 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt sm:flex-none"
          >
            Đặt lại
          </button>
        </div>
      </div>

      {/* Đường kẻ ngăn cách giữa 2 hàng */}
      <div className="mt-4 border-t border-border pt-4">

        {/* ---- Hàng 2: Các pill tab lọc nhanh theo trạng thái ---- */}
        <div className="flex flex-wrap gap-2">
          {FILTER_PILLS.map((pill) => {
            const isActive = activeTab === pill.key;
            const count = tabCounts?.[pill.key as keyof TabCounts];

            // Xác định lớp CSS cho pill đang active
            const activeClass = "bg-text-main text-surface";

            // Lớp CSS mặc định (không active): dùng pillClassName tùy chỉnh hoặc mặc định xám
            const defaultClass =
              pill.pillClassName ??
              "bg-surface-alt border border-border text-text-secondary hover:bg-surface-container";

            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onTabChange(pill.key)}
                className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${
                  isActive ? activeClass : defaultClass
                }`}
              >
                {/* Hiển thị số lượng trong ngoặc nếu có */}
                {pill.label}
                {count !== undefined && count > 0 && !isActive
                  ? ` (${count})`
                  : ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
