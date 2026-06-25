/**
 * page.tsx – Route Next.js App Router cho trang Quản lý Phôi Áo
 * Đường dẫn: /admin/san-pham-phoi-ao
 *
 * Đây là Server Component (mặc định trong App Router).
 * Nội dung thực tế được render bởi ProductsClient (client component)
 * để cho phép sử dụng useState, event handlers...
 *
 * Layout (sidebar + topbar) được cung cấp bởi AdminShell qua
 * file frontend/src/app/admin/layout.tsx → không cần khai báo lại ở đây.
 */

import type { Metadata } from "next";
import ProductsClient from "@/components/admin/products/ProductsClient";

// SEO: tiêu đề trang hiển thị trên tab trình duyệt
export const metadata: Metadata = {
  title: "Sản phẩm / Phôi áo – TeeStudio Quản trị",
  description:
    "Quản lý danh mục phôi áo, biến thể màu và kích thước, giá nền và tồn kho cho hệ thống in áo tự thiết kế TeeStudio.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function chuyenTrangThai(value: string): string {
  const status = value.trim().toUpperCase();
  if (status === "ACTIVE" || status === "DANG_HIEN_THI") {
    return "dang_hien_thi";
  }
  if (status === "INACTIVE" || status === "DANG_AN") {
    return "dang_an";
  }
  return "";
}

function chuyenTonKho(
  value: string
): "tat_ca" | "ban_chay" | "con_hang" | "sap_het" | "het_hang" {
  const stock = value.trim().toUpperCase();
  if (stock === "LOW" || stock === "SAP_HET") return "sap_het";
  if (stock === "OUT" || stock === "HET_HANG") return "het_hang";
  if (stock === "AVAILABLE" || stock === "CON_HANG") return "con_hang";
  if (stock === "BEST_SELLING" || stock === "BAN_CHAY") return "ban_chay";
  return "tat_ca";
}

export default async function ProductsAdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const initialFilters = {
    status: chuyenTrangThai(layGiaTriDauTien(params.status)),
    stock: chuyenTonKho(layGiaTriDauTien(params.stock)),
  };

  return (
    <ProductsClient
      key={JSON.stringify(initialFilters)}
      initialFilters={initialFilters}
    />
  );
}
