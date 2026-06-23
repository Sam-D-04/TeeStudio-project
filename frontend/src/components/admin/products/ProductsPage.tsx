"use client";

/**
 * ProductsPage – trang quản lý phôi áo (nội dung chính, không bao gồm sidebar/topbar).
 *
 * Component điều phối (orchestrator) cho toàn bộ trang.
 * Tất cả dữ liệu được lấy từ API thông qua React Query + productService.
 *
 * Cấu trúc layout:
 * - Tiêu đề + nút hành động (đầu trang)
 * - 4 thẻ KPI thống kê
 * - Bảng phôi áo
 */

import {
  PlusOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import * as productService from "@/services/admin/productService";
import type { SanPham } from "@/services/admin/productService";
import ProductFilterBar from "./ProductFilterBar";
import ProductPagination from "./ProductPagination";
import ProductStatCard from "./ProductStatCard";
import ProductTable from "./ProductTable";

// ===== HẰNG SỐ =====
const SO_MOI_TRANG = 10;

export default function ProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // ===== STATE QUẢN LÝ FILTER =====
  const [searchKeyword, setSearchKeyword] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "tat_ca" | "con_hang" | "sap_het" | "het_hang"
  >("tat_ca");

  // ===== STATE PHÂN TRANG =====
  const [currentPage, setCurrentPage] = useState(1);

  // ===== LẤY DỮ LIỆU TỪ API =====

  /** Thống kê KPI (4 thẻ đầu trang) */
  const {
    data: thongKe,
    isLoading: dangTaiThongKe,
  } = useQuery({
    queryKey: ["products", "stats"],
    queryFn: productService.layThongKeSanPham,
    staleTime: 30_000,
  });

  /** Danh sách phôi áo (phân trang + lọc) */
  const {
    data: ketQuaDanhSach,
    isLoading: dangTaiDanhSach,
    isError: coLoiDanhSach,
  } = useQuery({
    queryKey: [
      "products",
      "list",
      currentPage,
      searchKeyword,
      categoryFilter,
      statusFilter,
      stockFilter,
    ],
    queryFn: () =>
      productService.layDanhSachSanPham({
        trang: currentPage,
        soMoiTrang: SO_MOI_TRANG,
        tuKhoa: searchKeyword,
        danhMuc: categoryFilter,
        trangThai: statusFilter,
        tonKho: stockFilter,
      }),
    staleTime: 15_000,
    placeholderData: (previousData) => previousData,
  });

  // ===== MUTATION XÓA =====
  const { mutate: thucHienXoa, isPending: dangXoa } = useMutation({
    mutationFn: (id: number) => productService.xoaSanPham(id),
    onSuccess: () => {
      // Làm mới danh sách và thống kê sau khi xóa
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: unknown) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi xóa phôi áo";
      alert(`Lỗi: ${msg}`);
    },
  });

  // ===== XỬ LÝ FILTER (reset về trang 1 khi filter thay đổi) =====
  function handleSearchChange(value: string) {
    setSearchKeyword(value);
    setCurrentPage(1);
  }

  function handleCategoryChange(value: string) {
    setCategoryFilter(value);
    setCurrentPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value);
    setCurrentPage(1);
  }

  function handleStockFilterChange(value: "tat_ca" | "con_hang" | "sap_het" | "het_hang") {
    setStockFilter(value);
    setCurrentPage(1);
  }

  // ===== XỬ LÝ HÀNH ĐỘNG =====

  /** Xem chi tiết: chuyển tới trang xem và sửa phôi áo */
  function handleView(product: SanPham) {
    router.push(`/admin/san-pham-phoi-ao/${product.id}`);
  }

  /** Chỉnh sửa: dùng chung trang xem và sửa phôi áo */
  function handleEdit(product: SanPham) {
    router.push(`/admin/san-pham-phoi-ao/${product.id}`);
  }

  /** Xóa: hiển thị hộp thoại xác nhận rồi gọi API */
  function handleDelete(product: SanPham) {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa "${product.name}"?\n\nLưu ý: Không thể xóa nếu phôi áo đang có trong đơn hàng.`
      )
    ) {
      thucHienXoa(product.id);
    }
  }

  // ===== DỮ LIỆU HIỂN THỊ =====
  const danhSachSanPham = ketQuaDanhSach?.danhSach ?? [];
  const tongSo = ketQuaDanhSach?.tongSo ?? 0;
  const tongSoTrang = ketQuaDanhSach?.tongSoTrang ?? 1;

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
            Quản lý danh mục phôi áo, biến thể màu và kích thước, giá nền và tồn kho
            dùng cho khách tự thiết kế.
          </p>
        </div>

        {/* Nhóm nút hành động đầu trang */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Nút chính: Thêm phôi áo mới */}
          <Link
            href="/admin/san-pham-phoi-ao/them-moi"
            className="flex h-control-h items-center gap-2 rounded-[10px] bg-[#0ea5e9] px-5 text-button-text font-semibold text-white shadow-sm transition-colors hover:bg-[#0284c7]"
          >
            <PlusOutlined />
            Thêm phôi áo
          </Link>
        </div>
      </section>

      {/* ===================================================
          LƯỚI NỘI DUNG CHÍNH
          =================================================== */}
      <div className="flex flex-col gap-6">

        {/* ===== KPI THỐNG KÊ ===== */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Tổng số phôi áo */}
          <ProductStatCard
            label="Tổng phôi áo"
            value={dangTaiThongKe ? "..." : (thongKe?.tongPhoi ?? 0)}
          />

          {/* Số phôi đang hiển thị trên cửa hàng */}
          <ProductStatCard
            label="Đang hiển thị"
            value={dangTaiThongKe ? "..." : (thongKe?.dangHienThi ?? 0)}
          />

          {/* Tổng số biến thể (tổng tất cả màu × kích thước) */}
          <ProductStatCard
            label="Tổng biến thể"
            value={dangTaiThongKe ? "..." : (thongKe?.tongBienThe ?? 0)}
          />

          {/* Biến thể sắp hết hàng – có accent cam vàng + badge cảnh báo */}
          <ProductStatCard
            label="Sắp hết hàng"
            value={dangTaiThongKe ? "..." : (thongKe?.sapHetHang ?? 0)}
            accentColor="#f59e0b"
            extraContent={
              <span className="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[11px] font-bold tracking-wider text-warning">
                <WarningOutlined className="text-[13px]" />
                CẢNH BÁO
              </span>
            }
          />
        </section>

        {/* ===== BẢNG DỮ LIỆU ===== */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

          {/* === Bảng phôi áo === */}
          <div className="xl:col-span-12">
            <section className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
              {/* Thanh filter: tìm kiếm + dropdown + pill filter */}
              <ProductFilterBar
                searchKeyword={searchKeyword}
                onSearchChange={handleSearchChange}
                categoryFilter={categoryFilter}
                onCategoryChange={handleCategoryChange}
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                stockFilter={stockFilter}
                onStockFilterChange={handleStockFilterChange}
              />

              {/* Trạng thái loading */}
              {dangTaiDanhSach && (
                <div className="flex items-center justify-center py-16 text-body-md text-text-muted">
                  <span className="animate-pulse">Đang tải danh sách phôi áo...</span>
                </div>
              )}

              {/* Trạng thái lỗi */}
              {!dangTaiDanhSach && coLoiDanhSach && (
                <div className="flex flex-col items-center justify-center gap-2 py-16 text-center text-body-md text-error">
                  <span>Không thể tải dữ liệu. Vui lòng thử lại.</span>
                  <button
                    type="button"
                    onClick={() =>
                      queryClient.invalidateQueries({ queryKey: ["products", "list"] })
                    }
                    className="mt-2 rounded-lg border border-error/30 px-4 py-1.5 text-body-sm text-error hover:bg-error/5"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {/* Bảng dữ liệu phôi áo */}
              {!dangTaiDanhSach && !coLoiDanhSach && (
                <>
                  <ProductTable
                    products={danhSachSanPham}
                    isLoading={dangXoa}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />

                  {/* Phân trang */}
                  <ProductPagination
                    currentPage={currentPage}
                    totalPages={tongSoTrang}
                    totalItems={tongSo}
                    itemsPerPage={SO_MOI_TRANG}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </section>
          </div>

        </div>
      </div>

      {/* Khoảng trống phía dưới để trang không bị sát */}
      <div className="h-12" />

    </div>
  );
}
