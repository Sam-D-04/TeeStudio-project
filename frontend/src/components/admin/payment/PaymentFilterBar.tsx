import DateRangeFilter, {
  type DateFilterPreset,
} from "@/components/admin/common/DateRangeFilter";

/**
 * PaymentFilterBar – thanh lọc giao dịch thanh toán.
 *
 * Gồm input tìm kiếm và các select box (Trạng thái, Phương thức, Thời gian).
 */

type PaymentFilterBarProps = {
  // Tìm kiếm theo mã đơn / mã giao dịch
  searchValue: string;
  onSearchChange: (value: string) => void;

  // Các select box
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;

  methodFilter: string;
  onMethodFilterChange: (value: string) => void;

  dateFilterKey: number;
  initialDatePreset?: DateFilterPreset;
  initialStartDate?: string;
  initialEndDate?: string;
  onDateChange: (startDate: string, endDate: string) => void;
  onDateClear: () => void;

  // Nút đặt lại
  onReset: () => void;
};

export default function PaymentFilterBar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  methodFilter,
  onMethodFilterChange,
  dateFilterKey,
  initialDatePreset = "today",
  initialStartDate,
  initialEndDate,
  onDateChange,
  onDateClear,
  onReset,
}: PaymentFilterBarProps) {
  return (
    // Khung filter: nền trắng, bo góc 12px, viền 1px, shadow nhẹ
    <div className="rounded-xl border border-border bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">

      {/* Input tìm kiếm + Select boxes + Nút đặt lại */}
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
              <option value="can_doi_soat">Cần đối soát</option>
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

        {/* Bộ lọc thời gian dùng chung */}
        <div className="w-full lg:w-auto">
          <label className="mb-1 block text-xs font-bold uppercase text-text-secondary">
            Thời gian
          </label>
          <DateRangeFilter
            key={dateFilterKey}
            initialPreset={initialDatePreset}
            initialStartDate={initialStartDate}
            initialEndDate={initialEndDate}
            allowClear
            onChange={onDateChange}
            onClear={onDateClear}
            selectClassName="h-control-h"
            rangePickerClassName="h-control-h"
          />
        </div>

        {/* Nút Đặt lại */}
        <div className="flex w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="h-control-h flex-1 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-surface-alt sm:flex-none"
          >
            Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
