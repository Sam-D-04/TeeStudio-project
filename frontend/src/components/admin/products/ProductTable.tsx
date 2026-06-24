"use client";

/**
 * ProductTable – bảng danh sách phôi áo với tính năng mở rộng biến thể.
 *
 * Tính năng:
 * 1. Hiển thị danh sách phôi áo (tên, danh mục, chất liệu, giá nền, biến thể, tồn kho, trạng thái).
 * 2. Bấm vào hàng hoặc mũi tên ở đầu để mở rộng/thu gọn phần biến thể màu × kích thước.
 * 3. Phần biến thể hiển thị bảng con với SKU, số lượng tồn, trạng thái từng biến thể.
 * 4. Các nút hành động: Xem chi tiết, Chỉnh sửa, Xóa.
 *
 * Thiết kế: bảng phẳng, nền trắng, header xám nhạt, hover row, border mảnh.
 */

import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  RightOutlined,
  SkinOutlined,
} from "@ant-design/icons";
import { Fragment, useState } from "react";
import type { SanPham, BienTheSanPham } from "@/services/admin/productService";
import {
  InventoryStatusBadge,
  ProductDisplayStatusBadge,
} from "./ProductStatusBadge";

// ===== TYPE RE-EXPORT để tương thích với code cũ tham chiếu =====
/** @deprecated Dùng SanPham từ productService thay thế */
export type Product = SanPham;
/** @deprecated Dùng BienTheSanPham từ productService thay thế */
export type ProductVariant = BienTheSanPham;

type ProductTableProps = {
  /** Danh sách phôi áo */
  products: SanPham[];
  /** Thông báo hiển thị khi danh sách sau lọc không có kết quả */
  emptyMessage?: string;
  /** Đang có thao tác loading (ví dụ: đang xóa) */
  isLoading?: boolean;
  /** Hàm gọi khi bấm nút Xem chi tiết */
  onView: (product: SanPham) => void;
  /** Hàm gọi khi bấm nút Chỉnh sửa */
  onEdit: (product: SanPham) => void;
  /** Hàm gọi khi bấm nút Xóa */
  onDelete: (product: SanPham) => void;
};

// ===== HÀM TIỆN ÍCH =====

/** Định dạng số tiền thành chuỗi VNĐ có dấu phẩy, ví dụ: 185000 → "185,000" */
function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN");
}

/** Tính tổng tồn kho của tất cả biến thể */
function getTotalStock(variants: BienTheSanPham[]): number {
  return variants.reduce((sum, v) => sum + v.stock, 0);
}

/** Đếm số màu (không trùng) trong danh sách biến thể */
function countColors(variants: BienTheSanPham[]): number {
  const uniqueColors = new Set(variants.map((v) => v.colorName));
  return uniqueColors.size;
}

/** Đếm số kích thước (không trùng) trong danh sách biến thể */
function countSizes(variants: BienTheSanPham[]): number {
  const uniqueSizes = new Set(variants.map((v) => v.size));
  return uniqueSizes.size;
}

// ===== COMPONENT CON: Hàng biến thể mở rộng =====

/**
 * VariantExpandedRow – phần hiển thị bảng biến thể khi mở rộng một phôi áo.
 * Hiển thị bên dưới hàng phôi áo, kéo dài theo chiều rộng bảng (colspan=9).
 */
function VariantExpandedRow({ variants }: { variants: BienTheSanPham[] }) {
  return (
    <tr className="border-b border-border shadow-inner">
      {/* colspan=9 để phần biến thể trải hết chiều rộng bảng */}
      <td colSpan={9} className="p-0">
        <div className="bg-surface-alt/50 px-12 py-4">
          {/* Card bên trong */}
          <div className="overflow-hidden rounded-lg border border-border bg-surface">
            {/* Tiêu đề mini */}
            <div className="flex items-center justify-between border-b border-border bg-surface-container-low px-4 py-2">
              <span className="text-label-bold font-bold uppercase text-text-secondary">
                Chi tiết biến thể ({variants.length})
              </span>
            </div>

            {/* Bảng biến thể */}
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-surface-alt text-[12px] text-text-muted">
                  <th className="px-4 py-2 font-normal">Màu sắc</th>
                  <th className="px-4 py-2 font-normal">Kích thước</th>
                  <th className="px-4 py-2 font-normal">Mã SKU</th>
                  <th className="px-4 py-2 text-right font-normal">Tồn kho</th>
                  <th className="px-4 py-2 text-center font-normal">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-text-secondary">
                {variants.map((variant) => {
                  // Xác định màu nền hàng theo trạng thái tồn kho
                  const rowBg =
                    variant.inventoryStatus === "sap_het"
                      ? "bg-warning/5"
                      : variant.inventoryStatus === "het_hang"
                      ? "bg-error-container/20"
                      : "";

                  return (
                    <tr
                      key={variant.id}
                      className={`border-b border-border/50 hover:bg-surface-alt ${rowBg}`}
                    >
                      {/* Chấm màu + tên màu */}
                      <td className="flex items-center gap-2 px-4 py-2">
                        <span
                          className="inline-block h-4 w-4 rounded-full border border-border shadow-sm"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                        {variant.colorName}
                      </td>
                      {/* Kích thước */}
                      <td className="px-4 py-2 font-medium">{variant.size}</td>
                      {/* Mã SKU dạng monospace */}
                      <td className="px-4 py-2 font-mono text-[12px]">
                        {variant.sku}
                      </td>
                      {/* Số lượng tồn kho: màu đặc biệt khi sắp hết/hết */}
                      <td
                        className={`px-4 py-2 text-right font-bold ${
                          variant.inventoryStatus === "sap_het"
                            ? "text-warning"
                            : variant.inventoryStatus === "het_hang"
                            ? "text-error"
                            : "text-text-main"
                        }`}
                      >
                        {variant.stock}
                      </td>
                      {/* Badge trạng thái tồn */}
                      <td className="px-4 py-2 text-center">
                        <InventoryStatusBadge
                          status={variant.inventoryStatus}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ===== COMPONENT CHÍNH: Bảng phôi áo =====

export default function ProductTable({
  products,
  emptyMessage = "Chưa có phôi áo nào. Bấm “Thêm phôi áo” để bắt đầu.",
  isLoading = false,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  // State lưu id của phôi áo đang được mở rộng (null = không có)
  const [expandedProductId, setExpandedProductId] = useState<number | null>(
    null
  );

  // Hàm toggle mở rộng / thu gọn hàng biến thể
  function toggleExpand(productId: number) {
    setExpandedProductId(
      // Nếu đang mở cái này thì đóng lại (trả về null)
      // Nếu đang mở cái khác thì mở cái mới
      expandedProductId === productId ? null : productId
    );
  }

  return (
    // overflow-x-auto để bảng scroll ngang trên màn hình nhỏ
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] border-collapse text-left">
        {/* ===== ĐẦU BẢNG ===== */}
        <thead>
          <tr className="border-b border-border bg-surface-alt text-label-bold font-bold text-text-secondary">
            {/* Cột mũi tên expand */}
            <th className="w-12 px-5 py-3 text-center" />
            {/* Cột Sản phẩm (tên + slug) */}
            <th className="px-5 py-3">Sản phẩm</th>
            {/* Cột Danh mục */}
            <th className="px-5 py-3">Danh mục</th>
            {/* Cột Chất liệu / Kiểu dáng */}
            <th className="px-5 py-3">Chất liệu / Kiểu dáng</th>
            {/* Cột Giá nền */}
            <th className="px-5 py-3 text-right">Giá nền (VNĐ)</th>
            {/* Cột Số biến thể */}
            <th className="px-5 py-3 text-center">Biến thể</th>
            {/* Cột Tồn kho tổng */}
            <th className="px-5 py-3 text-right">Tồn kho</th>
            {/* Cột Trạng thái hiển thị */}
            <th className="px-5 py-3 text-center">Trạng thái</th>
            {/* Cột Thao tác */}
            <th className="px-5 py-3 text-right">Thao tác</th>
          </tr>
        </thead>

        {/* ===== THÂN BẢNG ===== */}
        <tbody className="text-body-sm">
          {products.length === 0 ? (
            // Trạng thái rỗng: không có dữ liệu
            <tr>
              <td
                colSpan={9}
                className="py-16 text-center text-body-md text-text-muted"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            products.map((product) => {
              // Kiểm tra phôi áo này có đang được mở rộng không
              const isExpanded = expandedProductId === product.id;
              // Tính tổng tồn kho
              const totalStock = getTotalStock(product.variants);

              return (
                // Fragment có key để React theo dõi từng nhóm hàng (hàng chính + hàng mở rộng)
                // Dùng <Fragment key={...}> thay vì <> vì <> không nhận được prop key
                <Fragment key={product.id}>
                  {/* ===== HÀNG CHÍNH ===== */}
                  <tr
                    // Hàng đang expand: nền xanh rất nhạt
                    // Sản phẩm đang ẩn: opacity nhạt hơn
                    className={`cursor-pointer border-b border-border transition-colors hover:bg-surface-alt/50 ${
                      isExpanded ? "bg-primary-container/5" : ""
                    } ${product.displayStatus === "dang_an" ? "opacity-75" : ""}`}
                    onClick={() => toggleExpand(product.id)}
                  >
                    {/* Mũi tên expand / collapse */}
                    <td className="px-5 py-3 text-center">
                      {isExpanded ? (
                        <DownOutlined className="text-[18px] text-primary" />
                      ) : (
                        <RightOutlined className="text-[18px] text-text-muted" />
                      )}
                    </td>

                    {/* Tên sản phẩm + slug */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {/* Thumbnail placeholder (icon áo) */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1">
                          <div className="flex h-full w-full items-center justify-center rounded-md bg-surface-alt text-text-muted">
                            <SkinOutlined className="text-[22px]" />
                          </div>
                        </div>
                        <div>
                          {/* Tên phôi áo – đậm, màu đen */}
                          <div className="text-card-title font-bold text-text-main">
                            {product.name}
                          </div>
                          {/* Đường dẫn tĩnh – nhỏ, màu xám */}
                          <div className="mt-0.5 text-[12px] text-text-muted">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Danh mục */}
                    <td className="px-5 py-3 text-text-secondary">
                      {product.category}
                    </td>

                    {/* Chất liệu và kiểu dáng */}
                    <td className="px-5 py-3 text-text-secondary">
                      {product.material}
                      <br />
                      <span className="text-[12px] text-text-muted">
                        {product.fit}
                      </span>
                    </td>

                    {/* Giá nền – phải, đậm */}
                    <td className="px-5 py-3 text-right font-semibold text-text-main">
                      {formatPrice(product.basePrice)}
                    </td>

                    {/* Số biến thể: "X màu · Y kích thước" */}
                    <td className="px-5 py-3 text-center">
                      <span className="inline-flex min-h-7 max-w-[112px] items-center justify-center rounded-[4px] bg-surface-container px-3 py-1 text-center text-[13px] font-medium leading-5 text-text-secondary">
                        {countColors(product.variants)} màu ·{" "}
                        {countSizes(product.variants)} kích thước
                      </span>
                    </td>

                    {/* Tổng tồn kho */}
                    <td className="px-5 py-3 text-right font-semibold text-text-main">
                      {formatPrice(totalStock)}
                    </td>

                    {/* Badge trạng thái hiển thị */}
                    <td className="px-5 py-3 text-center">
                      <ProductDisplayStatusBadge
                        status={product.displayStatus}
                      />
                    </td>

                    {/* Nút hành động */}
                    <td
                      className="px-5 py-3 text-right"
                      // Ngăn click hàng khi bấm nút (tránh toggle expand)
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {/* Nút Xem chi tiết */}
                        <button
                          type="button"
                          title="Xem chi tiết"
                          onClick={() => onView(product)}
                          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                        >
                          <EyeOutlined className="text-[18px]" />
                        </button>
                        {/* Nút Chỉnh sửa */}
                        <button
                          type="button"
                          title="Chỉnh sửa"
                          onClick={() => onEdit(product)}
                          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-surface-alt hover:text-primary"
                        >
                          <EditOutlined className="text-[18px]" />
                        </button>
                        {/* Nút Xóa */}
                        <button
                          type="button"
                          title="Xóa"
                          onClick={() => onDelete(product)}
                          disabled={isLoading}
                          className="rounded p-1.5 text-text-secondary transition-colors hover:bg-error-container hover:text-error disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <DeleteOutlined className="text-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* ===== HÀNG MỞ RỘNG (BIẾN THỂ) ===== */}
                  {/* Chỉ hiển thị khi phôi áo này đang được expand */}
                  {isExpanded && (
                    <VariantExpandedRow
                      variants={product.variants}
                    />
                  )}
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
