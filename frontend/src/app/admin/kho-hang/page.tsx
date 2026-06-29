import type { Metadata } from "next";
import InventoryClient from "@/components/admin/inventory/InventoryClient";

/**
 * Trang Quản lý Kho hàng – Admin.
 *
 * Đây là Server Component (Next.js App Router).
 * Server Component không cần "use client" và được render trước trên server.
 * Lợi ích:
 * - Khai báo metadata (title, description) cho SEO.
 * - Giảm lượng JavaScript gửi về client.
 *
 * Layout admin dùng chung nằm ở app/admin/layout.tsx.
 * Nội dung và logic tương tác của trang nằm trong InventoryClient/InventoryPage.
 */

// Metadata SEO cho trang quản lý kho hàng
export const metadata: Metadata = {
  title: "Quản lý kho phôi áo - TeeStudio Quản trị",
  description:
    "Theo dõi tồn kho áo trơn theo màu, size và SKU. Quản lý nhập xuất phôi áo trước khi chuyển sang xưởng in.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function KhoHangPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const stock = layGiaTriDauTien(params.stock).toUpperCase();
  const transaction = layGiaTriDauTien(params.transaction).toUpperCase();
  const period = layGiaTriDauTien(params.period).toUpperCase();
  const variantIdParam = layGiaTriDauTien(params.variantId);
  const parsedVariantId = Number(variantIdParam);
  const initialVariantId =
    Number.isInteger(parsedVariantId) && parsedVariantId > 0
      ? parsedVariantId
      : undefined;
  const initialSearchKeyword = initialVariantId
    ? layGiaTriDauTien(params.sku).trim()
    : "";
  const initialStockFilter =
    stock === "LOW"
      ? "ton_thap"
      : stock === "LOW_STOCK"
        ? "sap_het"
        : stock === "RESERVED"
          ? "can_xuat"
          : transaction === "IMPORT" && period === "THIS_MONTH"
            ? "nhap_thang"
            : "tat_ca";

  return (
    <InventoryClient
      key={`${initialStockFilter}-${initialVariantId ?? "all"}`}
      initialStockFilter={initialStockFilter}
      initialVariantId={initialVariantId}
      initialSearchKeyword={initialSearchKeyword}
    />
  );
}
