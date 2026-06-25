"use client";

import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import DateRangeFilter from "@/components/admin/common/DateRangeFilter";

/**
 * InventoryFilterBar – thanh lọc dữ liệu kho hàng.
 *
 * Gồm hai phần đặt cạnh nhau:
 * 1. Ô tìm kiếm: tìm theo SKU hoặc tên phôi áo.
 * 2. Dãy pill (nút bo tròn): lọc nhanh theo loại/trạng thái tồn kho.
 *
 * State (trạng thái) nội bộ:
 * - Ô tìm kiếm: do component cha quản lý qua props (searchValue, onSearchChange)
 * - Pill đang chọn: do component cha quản lý qua props (activeFilter, onFilterChange)
 */

// Định nghĩa kiểu cho mỗi pill filter
type PillFilter = {
  key: string;   // Giá trị dùng để so sánh, ví dụ "tat_ca"
  label: string; // Nhãn hiển thị, ví dụ "Tất cả"
};

// Danh sách các pill filter – mỗi pill tương ứng với một điều kiện lọc
const PILL_FILTERS: PillFilter[] = [
  { key: "tat_ca",      label: "Tất cả" },
  { key: "ton_thap",    label: "Tồn kho thấp" },
  { key: "sap_het",     label: "Sắp hết hàng" },
  { key: "het_hang",    label: "Hết hàng" },
  { key: "can_xuat",    label: "Cần xuất đơn in" },
  { key: "nhap_thang",  label: "Nhập tháng này" },
];

// Kiểu dữ liệu props nhận từ component cha (InventoryPage)
type InventoryFilterBarProps = {
  searchValue: string;                    // Giá trị ô tìm kiếm hiện tại
  onSearchChange: (val: string) => void;  // Hàm gọi khi người dùng gõ tìm kiếm

  activeFilter: string;                   // Key của pill đang được chọn
  onFilterChange: (key: string) => void;  // Hàm gọi khi người dùng bấm pill

  onDateChange: (startDate: string, endDate: string) => void;
  onDateClear: () => void;
  onResetFilters?: () => void;            // Hàm đặt lại tất cả bộ lọc
};

export default function InventoryFilterBar({
  searchValue,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onDateChange,
  onDateClear,
  onResetFilters,
}: InventoryFilterBarProps) {
  return (
    // Khu vực filter: nền xám rất nhạt, viền dưới, padding đều 16px
    <div className="space-y-3 border-b border-border bg-surface-alt px-4 py-4">

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* ---- Phần trái: Ô tìm kiếm + nút Bộ lọc ---- */}
        <div className="flex items-center gap-3">

          {/* Ô tìm kiếm SKU / tên phôi áo */}
          <div className="relative w-full md:w-64">
            {/* Icon kính lúp – nằm bên trái, không thể click */}
            <SearchOutlined
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
              style={{ fontSize: 16 }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tìm SKU, tên phôi..."
              className="h-10 w-full rounded-lg border border-border bg-surface py-0 pl-9 pr-3 text-sm text-text-main outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
            />
          </div>

          {/* Nút "Bộ lọc" – dùng để mở filter nâng cao (mở rộng sau) */}
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <FilterOutlined style={{ fontSize: 16 }} />
            <span>Bộ lọc</span>
          </button>
        </div>

        {/* ---- Phần phải: Dãy pill filter ---- */}
        <div className="flex flex-wrap gap-2">
          {PILL_FILTERS.map((pill) => {
            // Pill đang được chọn: nền xanh nhạt, viền xanh, chữ xanh đậm, chữ đậm
            // Pill chưa chọn: nền trắng, viền xám, chữ xám
            const isActive = activeFilter === pill.key;
            const activeClass = isActive
              ? "border-primary-container bg-primary-container/10 text-primary-container font-bold"
              : "border-border bg-surface text-text-secondary hover:bg-surface-alt font-semibold";

            return (
              <button
                key={pill.key}
                type="button"
                onClick={() => onFilterChange(pill.key)}
                className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${activeClass}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="shrink-0 text-xs font-bold uppercase text-text-secondary">
            SKU có biến động trong khoảng
          </span>
          <DateRangeFilter
            initialPreset="custom"
            allowClear
            onChange={onDateChange}
            onClear={onDateClear}
            rangePickerClassName="sm:w-[280px]"
          />
        </div>

        {/* Nút Đặt lại */}
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="flex h-9 items-center justify-center rounded-[10px] bg-surface-alt px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-border hover:text-text-main sm:ml-auto"
          >
            Đặt lại
          </button>
        )}
      </div>

    </div>
  );
}
