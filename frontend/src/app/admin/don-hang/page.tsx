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
  const statuses = value
    .split(",")
    .map((status) => status.trim().toUpperCase())
    .filter(Boolean);

  if (statuses.includes("PENDING")) return "cho_xac_nhan";
  if (statuses.includes("PROCESSING") || statuses.includes("PRINTING")) {
    return "dang_xu_ly_in";
  }
  if (statuses.includes("CANCELLED")) return "da_huy";
  if (statuses.includes("COMPLETED") || statuses.includes("DELIVERED")) {
    return "hoan_tat";
  }

  return "tat_ca";
}

function chuyenThanhToanSangBoLoc(value: string): string {
  const payment = value.trim().toUpperCase();

  if (payment === "PENDING") return "cho_thanh_toan";
  if (payment === "COMPLETED") return "da_thanh_toan";

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
  const hour = layGiaTriDauTien(params.hour);
  const initialFilters = {
    status: chuyenTrangThaiSangBoLoc(layGiaTriDauTien(params.status)),
    payment: chuyenThanhToanSangBoLoc(layGiaTriDauTien(params.payment)),
    startDate: laNgayHopLe(date) ? date : laNgayHopLe(from) ? from : "",
    endDate: laNgayHopLe(date) ? date : laNgayHopLe(to) ? to : "",
    dateField:
      layGiaTriDauTien(params.dateField) === "completed"
        ? ("completed" as const)
        : ("created" as const),
    hour: /^(?:[01]\d|2[0-3])$/.test(hour) ? hour : "",
  };
  const filterKey = JSON.stringify(initialFilters);

  return (
    <OrdersClient
      key={filterKey}
      initialFilters={initialFilters}
    />
  );
}
