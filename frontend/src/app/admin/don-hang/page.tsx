import type { Metadata } from "next";
import OrdersClient from "@/components/admin/orders/OrdersClient";

/**
 * Metadata SEO cho trang Quản lý đơn hàng.
 * Next.js tự động đặt <title> và <meta description> vào <head>.
 */
export const metadata: Metadata = {
  title: "Quản lý đơn hàng – TeeStudio Quản trị",
  description:
    "Theo dõi và xử lý đơn hàng áo tùy chỉnh: trạng thái sản xuất, thanh toán, giao hàng.",
};

/**
 * Trang Quản lý đơn hàng.
 * Route: /admin/don-hang
 *
 * Layout admin dùng chung nằm ở app/admin/layout.tsx.
 * Logic tương tác của trang nằm trong OrdersClient/OrdersPage.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function chuyenTrangThaiSangBoLoc(value: string): string {
  // Trước tiên kiểm tra nếu đã là frontend filter key
  const FRONTEND_KEYS = ["tat_ca", "cho_xac_nhan", "da_xac_nhan", "dang_xu_ly_in", "cho_giao", "dang_giao", "hoan_tat", "da_huy"];
  if (FRONTEND_KEYS.includes(value)) return value;

  // Sau đó mới map từ DB status (uppercase)
  const statuses = value
    .split(",")
    .map((status) => status.trim().toUpperCase())
    .filter(Boolean);

  if (statuses.includes("PENDING")) return "cho_xac_nhan";
  if (statuses.includes("CONFIRMED")) return "da_xac_nhan";
  if (statuses.includes("PROCESSING") || statuses.includes("PRINTING")) {
    return "dang_xu_ly_in";
  }
  if (statuses.includes("READY_TO_SHIP")) return "cho_giao";
  if (statuses.includes("SHIPPING") || statuses.includes("DELIVERING")) return "dang_giao";
  if (statuses.includes("CANCELLED")) return "da_huy";
  if (statuses.includes("COMPLETED") || statuses.includes("DELIVERED")) {
    return "hoan_tat";
  }

  return "tat_ca";
}

function chuyenThanhToanSangBoLoc(value: string): string {
  // Kiểm tra nếu đã là frontend filter key
  const FRONTEND_PAYMENT_KEYS = ["tat_ca", "da_dat_coc", "da_thanh_toan", "cho_thanh_toan", "can_doi_soat"];
  if (FRONTEND_PAYMENT_KEYS.includes(value)) return value;

  // Map từ DB payment status
  const payment = value.trim().toUpperCase();

  if (payment === "PENDING") return "cho_thanh_toan";
  if (payment === "PENDING_RECONCILIATION") return "can_doi_soat";
  if (payment === "PARTIALLY_PAID") return "da_dat_coc";
  if (payment === "PAID" || payment === "COMPLETED") return "da_thanh_toan";

  return "tat_ca";
}

function laNgayHopLe(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const date = layGiaTriDauTien(params.date);
  const from = layGiaTriDauTien(params.from);
  const to = layGiaTriDauTien(params.to);
  // Cũng chấp nhận startDate/endDate (dùng từ trang thống kê)
  const startDate = layGiaTriDauTien(params.startDate);
  const endDate = layGiaTriDauTien(params.endDate);
  const hour = layGiaTriDauTien(params.hour);
  const excludeStatus = layGiaTriDauTien(params.excludeStatus).toUpperCase();
  const excludeReason = layGiaTriDauTien(params.excludeReason);
  const initialFilters = {
    status: chuyenTrangThaiSangBoLoc(layGiaTriDauTien(params.status)),
    payment: chuyenThanhToanSangBoLoc(layGiaTriDauTien(params.payment)),
    startDate: laNgayHopLe(date) ? date : laNgayHopLe(from) ? from : laNgayHopLe(startDate) ? startDate : "",
    endDate: laNgayHopLe(date) ? date : laNgayHopLe(to) ? to : laNgayHopLe(endDate) ? endDate : "",
    dateField:
      layGiaTriDauTien(params.dateField) === "completed"
        ? ("completed" as const)
        : layGiaTriDauTien(params.dateField) === "paid"
          ? ("paid" as const)
          : ("created" as const),
    hour: /^(?:[01]\d|2[0-3])$/.test(hour) ? hour : "",
    excludeStatus: excludeStatus === "CANCELLED" ? "CANCELLED" : "",
    excludeReason: excludeReason,
  };
  const filterKey = JSON.stringify(initialFilters);

  return (
    <OrdersClient
      key={filterKey}
      initialFilters={initialFilters}
    />
  );
}
