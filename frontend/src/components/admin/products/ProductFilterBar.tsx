/**
 * ProductFilterBar – thanh bộ lọc & tìm kiếm trong trang quản lý phôi áo.
 *
 * Gồm 3 phần:
 * 1. Ô tìm kiếm (theo tên phôi áo)
 * 2. Dropdown lọc danh mục – lấy từ API (không hardcode)
 * 3. Dropdown lọc trạng thái (Đang hiển thị / Đang ẩn)
 * 4. Nhóm pill filter: Tất cả / Còn hàng / Sắp hết / Hết hàng
 *
 * Tất cả state lọc được quản lý ở ProductsPage và truyền xuống qua props.
 */

import { SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import * as productService from "@/services/admin/productService";

// ===== KIỂU DỮ LIỆU CHO FILTER =====
// Mỗi pill filter kho có giá trị (value) và nhãn hiển thị (label)
type StockPillFilter = "tat_ca" | "con_hang" | "sap_het" | "het_hang";

type ProductFilterBarProps = {
  /** Từ khóa tìm kiếm hiện tại */
  searchKeyword: string;
  /** Hàm cập nhật từ khóa tìm kiếm */
  onSearchChange: (value: string) => void;

  /** Danh mục đang được lọc (tên danh mục) */
  categoryFilter: string;
  /** Hàm cập nhật danh mục */
  onCategoryChange: (value: string) => void;

  /** Trạng thái hiển thị đang được lọc */
  statusFilter: string;
  /** Hàm cập nhật trạng thái hiển thị */
  onStatusChange: (value: string) => void;

  /** Bộ lọc tồn kho (pill) đang active */
  stockFilter: StockPillFilter;
  /** Hàm cập nhật bộ lọc tồn kho */
  onStockFilterChange: (value: StockPillFilter) => void;
};

// Cấu hình các pill filter tồn kho
const stockPills: { value: StockPillFilter; label: string; dotColor?: string }[] = [
  { value: "tat_ca", label: "Tất cả" },
  { value: "con_hang", label: "Còn hàng" },
  { value: "sap_het", label: "Sắp hết", dotColor: "#f59e0b" },
  { value: "het_hang", label: "Hết hàng", dotColor: "#ea580c" },
];

export default function ProductFilterBar({
  searchKeyword,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  stockFilter,
  onStockFilterChange,
}: ProductFilterBarProps) {
  // Lấy danh sách danh mục từ API để hiển thị trong dropdown
  const { data: danhSachDanhMuc = [] } = useQuery({
    queryKey: ["products", "categories"],
    queryFn: productService.layDanhMucSanPham,
    staleTime: 5 * 60_000, // Cache 5 phút, danh mục ít thay đổi
  });

  return (
    // Thanh filter: nền trắng ngà nhẹ, border bên dưới
    <div className="flex flex-col gap-4 border-b border-border bg-surface-alt/30 p-5 lg:flex-row lg:items-center lg:justify-between">
      
      {/* ===== Nhóm trái: tìm kiếm + dropdown ===== */}
      <div className="flex flex-col gap-3 sm:flex-row">
        
        {/* Ô tìm kiếm theo tên phôi áo */}
        <label className="relative flex h-control-h w-full items-center rounded-[10px] border border-border bg-surface-alt px-3 text-text-secondary transition-all focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container sm:w-[280px]">
          <SearchOutlined className="mr-2 text-[18px] text-text-muted" />
          <input
            id="product-search"
            type="search"
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tên phôi áo..."
            className="h-full w-full bg-transparent text-body-md text-text-main outline-none placeholder:text-text-muted"
          />
        </label>

        {/* Dropdown lọc theo danh mục (lấy từ API) */}
        <select
          id="category-filter"
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          aria-label="Lọc theo danh mục"
          className="h-control-h min-w-[160px] rounded-[10px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        >
          <option value="">Danh mục (Tất cả)</option>
          {danhSachDanhMuc.map((dm) => (
            <option key={dm.id} value={dm.ten}>
              {dm.ten}
            </option>
          ))}
        </select>

        {/* Dropdown lọc theo trạng thái hiển thị */}
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          aria-label="Lọc theo trạng thái hiển thị"
          className="h-control-h min-w-[160px] rounded-[10px] border border-border bg-surface-alt px-3 text-body-md text-text-main outline-none transition-all focus:border-primary-container focus:ring-1 focus:ring-primary-container"
        >
          <option value="">Trạng thái (Tất cả)</option>
          <option value="dang_hien_thi">Đang hiển thị</option>
          <option value="dang_an">Đang ẩn</option>
        </select>
      </div>

      {/* ===== Nhóm phải: pill filter tồn kho ===== */}
      {/* overflow-x-auto để scroll ngang trên mobile */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
        {stockPills.map((pill) => {
          // Kiểm tra pill đang được chọn
          const isActive = stockFilter === pill.value;

          return (
            <button
              key={pill.value}
              type="button"
              onClick={() => onStockFilterChange(pill.value)}
              className={`flex shrink-0 items-center gap-1 rounded-full px-4 py-1.5 text-label-bold font-bold transition-colors ${
                isActive
                  ? // Active: nền xanh nhạt + viền xanh + chữ xanh
                    "border border-primary-container/40 bg-primary-container/10 text-primary-container"
                  : // Inactive: nền trắng + viền xám + chữ xám
                    "border border-border bg-surface text-text-secondary hover:bg-surface-alt"
              }`}
            >
              {pill.label}
              {/* Chấm màu nhỏ bên cạnh (chỉ có ở "Sắp hết" và "Hết hàng") */}
              {pill.dotColor && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: pill.dotColor }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
