"use client";

/**
 * ProductsPage – trang quản lý phôi áo (nội dung chính, không bao gồm sidebar/topbar).
 *
 * Đây là component "điều phối" (orchestrator) cho toàn bộ trang.
 * Nó:
 * 1. Giữ tất cả state (filter, phân trang, ...)
 * 2. Định nghĩa dữ liệu mẫu (MOCK DATA) – sau này thay bằng API
 * 3. Render các sub-component: tiêu đề, stat cards, filter bar, bảng, phân trang, panel cảnh báo
 *
 * Cấu trúc layout:
 * - Tiêu đề + nút hành động (đầu trang)
 * - 4 thẻ KPI thống kê
 * - Grid 12 cột:
 *     - Cột trái (9/12): bảng phôi áo
 *     - Cột phải (3/12): panel cảnh báo tồn kho
 */

import {
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useState } from "react";
import type { InventoryAlertItem } from "./InventoryAlertPanel";
import InventoryAlertPanel from "./InventoryAlertPanel";
import ProductFilterBar from "./ProductFilterBar";
import ProductPagination from "./ProductPagination";
import ProductStatCard from "./ProductStatCard";
import ProductTable, { type Product } from "./ProductTable";

// ===========================================================================
// ===== DỮ LIỆU MẪU (MOCK DATA) =============================================
// Phần này sẽ được thay bằng dữ liệu từ API thực tế sau khi Backend hoàn thành.
// Tham khảo file Huongdan_BE.md để biết endpoint và cấu trúc response.
// ===========================================================================

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Áo Thun Cao Cấp Nặng",
    slug: "ao-thun-cao-cap-nang",
    category: "Áo thun T-shirt",
    material: "Cotton 100% 250gsm",
    fit: "Oversized fit",
    basePrice: 185000,
    displayStatus: "dang_hien_thi",
    variants: [
      {
        id: 101,
        colorName: "Đen",
        colorHex: "#000000",
        size: "S",
        sku: "HVWT-BLK-S",
        stock: 150,
        inventoryStatus: "con_hang",
      },
      {
        id: 102,
        colorName: "Đen",
        colorHex: "#000000",
        size: "M",
        sku: "HVWT-BLK-M",
        stock: 210,
        inventoryStatus: "con_hang",
      },
      {
        id: 103,
        colorName: "Trắng",
        colorHex: "#ffffff",
        size: "L",
        sku: "HVWT-WHT-L",
        stock: 12,
        inventoryStatus: "sap_het",
      },
      {
        id: 104,
        colorName: "Navy",
        colorHex: "#1e3a8a",
        size: "XL",
        sku: "HVWT-NVY-XL",
        stock: 0,
        inventoryStatus: "het_hang",
      },
    ],
  },
  {
    id: 2,
    name: "Áo Polo Thoải Mái Cơ Bản",
    slug: "ao-polo-thoai-mai-co-ban",
    category: "Áo Polo",
    material: "CVC 65/35 Cá sấu",
    fit: "Regular fit",
    basePrice: 145000,
    displayStatus: "dang_hien_thi",
    variants: [
      {
        id: 201,
        colorName: "Đen",
        colorHex: "#000000",
        size: "S",
        sku: "POLO-BLK-S",
        stock: 8,
        inventoryStatus: "sap_het",
      },
      {
        id: 202,
        colorName: "Trắng",
        colorHex: "#ffffff",
        size: "M",
        sku: "POLO-WHT-M",
        stock: 95,
        inventoryStatus: "con_hang",
      },
      {
        id: 203,
        colorName: "Xanh navy",
        colorHex: "#1e3a8a",
        size: "L",
        sku: "POLO-NVY-L",
        stock: 62,
        inventoryStatus: "con_hang",
      },
    ],
  },
  {
    id: 3,
    name: "Áo Hoodie Mùa Đông Lông Cừu",
    slug: "ao-hoodie-mua-dong-long-cuu",
    category: "Áo Hoodie",
    material: "Nỉ chân cua 350gsm",
    fit: "Relaxed fit",
    basePrice: 250000,
    displayStatus: "dang_an",
    variants: [
      {
        id: 301,
        colorName: "Đen",
        colorHex: "#000000",
        size: "M",
        sku: "HDFLC-BLK-M",
        stock: 0,
        inventoryStatus: "het_hang",
      },
      {
        id: 302,
        colorName: "Xám",
        colorHex: "#6b7280",
        size: "L",
        sku: "HDFLC-GRY-L",
        stock: 0,
        inventoryStatus: "het_hang",
      },
    ],
  },
];

// Danh sách cảnh báo tồn kho (lấy từ MOCK_PRODUCTS, biến thể sắp hết hoặc hết hàng)
const MOCK_ALERTS: InventoryAlertItem[] = [
  {
    id: 1,
    productName: "Áo Thun Cao Cấp Nặng",
    colorName: "Trắng",
    colorHex: "#ffffff",
    size: "L",
    sku: "HVWT-WHT-L",
    stock: 12,
    severity: "sap_het",
  },
  {
    id: 2,
    productName: "Áo Thun Cao Cấp Nặng",
    colorName: "Navy",
    colorHex: "#1e3a8a",
    size: "XL",
    sku: "HVWT-NVY-XL",
    stock: 0,
    severity: "het_hang",
  },
  {
    id: 3,
    productName: "Áo Polo Thoải Mái Cơ Bản",
    colorName: "Đen",
    colorHex: "#000000",
    size: "S",
    sku: "POLO-BLK-S",
    stock: 8,
    severity: "sap_het",
  },
];

// ===========================================================================
// ===== KẾT THÚC DỮ LIỆU MẪU ===============================================
// ===========================================================================

export default function ProductsPage() {
  // ===== STATE QUẢN LÝ FILTER =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "tat_ca" | "con_hang" | "sap_het" | "het_hang"
  >("tat_ca");

  // ===== STATE PHÂN TRANG =====
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  // Tổng số thực tế sẽ lấy từ API (response có trường total)
  const TOTAL_ITEMS = 12;

  // ===== CÁC SỐ LIỆU THỐNG KÊ (MOCK) =====
  // Sẽ được thay bằng dữ liệu từ API endpoint: GET /api/admin/products/stats
  const STAT_DATA = {
    tongPhoi: 12,
    dangHienThi: 10,
    tongBienThe: 86,
    sapHetHang: 5,
  };

  // ===== XỬ LÝ HÀNH ĐỘNG =====

  // Xem chi tiết: mở modal hoặc chuyển trang chi tiết
  function handleView(product: Product) {
    // TODO: Mở modal chi tiết hoặc navigate đến /admin/san-pham-phoi-ao/[id]
    alert(`Xem chi tiết: ${product.name}`);
  }

  // Chỉnh sửa: chuyển đến trang edit
  function handleEdit(product: Product) {
    // TODO: navigate đến /admin/san-pham-phoi-ao/[id]/chinh-sua
    alert(`Chỉnh sửa: ${product.name}`);
  }

  // Xóa: hiển thị hộp thoại xác nhận rồi gọi API DELETE
  function handleDelete(product: Product) {
    // TODO: Hiện modal confirm, nếu đồng ý thì gọi DELETE /api/admin/products/[id]
    if (window.confirm(`Bạn có chắc muốn xóa "${product.name}"?`)) {
      alert(`Đã xóa: ${product.name}`);
    }
  }

  return (
    <div>
      {/* ===================================================
          TIÊU ĐỀ TRANG + CÁC NÚT HÀNH ĐỘNG
          =================================================== */}
      <section className="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        {/* Tiêu đề + mô tả ngắn */}
        <div>
          <h2 className="font-extrabold text-headline-lg-mobile text-text-main md:text-headline-lg">
            Sản phẩm / Phôi áo
          </h2>
          <p className="mt-1 max-w-2xl text-body-sm text-text-secondary">
            Quản lý danh mục phôi áo, biến thể màu và size, giá nền và tồn kho
            dùng cho khách tự thiết kế.
          </p>
        </div>

        {/* Nhóm nút hành động đầu trang */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút phụ: Xuất danh sách ra file Excel/CSV */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <DownloadOutlined />
            Xuất danh sách
          </button>

          {/* Nút phụ: Nhập từ file Excel */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] border border-border bg-surface px-4 text-button-text font-semibold text-text-secondary transition-colors hover:bg-surface-alt"
          >
            <UploadOutlined />
            Nhập Excel
          </button>

          {/* Nút chính: Thêm phôi áo mới */}
          <button
            type="button"
            className="flex h-control-h items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-5 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusOutlined />
            Thêm phôi áo
          </button>
        </div>
      </section>

      {/* ===================================================
          LƯỚI NỘI DUNG CHÍNH (12 cột)
          - Cột trái (9/12): 4 thẻ KPI + bảng phôi áo
          - Cột phải (3/12): panel cảnh báo tồn kho
          =================================================== */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        
        {/* ===== CỘT TRÁI: KPI + BẢNG ===== */}
        <div className="flex flex-col gap-6 xl:col-span-9">

          {/* 4 thẻ KPI thống kê */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Tổng số phôi áo */}
            <ProductStatCard label="Tổng phôi áo" value={STAT_DATA.tongPhoi} />

            {/* Số phôi đang hiển thị trên cửa hàng */}
            <ProductStatCard
              label="Đang hiển thị"
              value={STAT_DATA.dangHienThi}
            />

            {/* Tổng số biến thể (tổng tất cả màu × size) */}
            <ProductStatCard
              label="Tổng biến thể"
              value={STAT_DATA.tongBienThe}
            />

            {/* Biến thể sắp hết hàng – có accent cam vàng + badge cảnh báo */}
            <ProductStatCard
              label="Sắp hết hàng"
              value={STAT_DATA.sapHetHang}
              accentColor="#f59e0b"
              extraContent={
                <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-warning">
                  <WarningOutlined className="text-[13px]" />
                  CẢNH BÁO
                </span>
              }
            />
          </section>

          {/* Card bảng phôi áo chính */}
          <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
            {/* Thanh filter: tìm kiếm + dropdown + pill filter */}
            <ProductFilterBar
              searchKeyword={searchKeyword}
              onSearchChange={setSearchKeyword}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              stockFilter={stockFilter}
              onStockFilterChange={setStockFilter}
            />

            {/* Bảng dữ liệu phôi áo */}
            <ProductTable
              products={MOCK_PRODUCTS}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Phân trang */}
            <ProductPagination
              currentPage={currentPage}
              totalPages={Math.ceil(TOTAL_ITEMS / ITEMS_PER_PAGE)}
              totalItems={TOTAL_ITEMS}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>

        {/* ===== CỘT PHẢI: PANEL CẢNH BÁO TỒN KHO ===== */}
        <div className="xl:col-span-3">
          <InventoryAlertPanel
            alerts={MOCK_ALERTS}
            totalAlertCount={MOCK_ALERTS.length}
          />
        </div>
      </div>

      {/* Khoảng trống phía dưới để trang không bị sát */}
      <div className="h-12" />
    </div>
  );
}
