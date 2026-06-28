import type { Metadata } from "next";
import PaymentClient from "@/components/admin/payment/PaymentClient";

// Metadata SEO cho trang thanh toán (Server Component)
export const metadata: Metadata = {
  title: "Quản lý thanh toán - TeeStudio Quản trị",
  description:
    "Theo dõi giao dịch VNPAY, COD, đối soát doanh thu, xử lý lỗi thanh toán và hoàn tiền.",
};

/**
 * ThanhToanPage – Server Component cho route /admin/thanh-toan.
 *
 * Nhiệm vụ duy nhất: render PaymentClient (Client Component) để
 * trang được bọc trong AdminShell (sidebar + topbar) từ layout.tsx.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function laNgayHopLe(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function ThanhToanPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = layGiaTriDauTien(params.status).toUpperCase();
  const statuses = status.split(",").map((item) => item.trim());
  const method = layGiaTriDauTien(params.method).toUpperCase();
  const date = layGiaTriDauTien(params.date);
  const isExplicit = Boolean(status || method || date);
  const initialFilters = isExplicit
    ? {
        status:
          statuses.includes("PENDING") && method === "COD"
            ? "can_doi_soat"
            : statuses.includes("COMPLETED")
          ? "da_thanh_toan"
          : statuses.includes("PENDING")
            ? "cho_thanh_toan"
            : statuses.includes("FAILED") || statuses.includes("CANCELLED")
              ? "that_bai"
              : "tat_ca",
        method:
          method === "VNPAY" ? "vnpay" : method === "COD" ? "cod" : "tat_ca",
        startDate: laNgayHopLe(date) ? date : "",
        endDate: laNgayHopLe(date) ? date : "",
        dateField:
          layGiaTriDauTien(params.dateField) === "paid"
            ? ("paid" as const)
            : ("created" as const),
      }
    : undefined;

  return (
    <PaymentClient
      key={JSON.stringify(initialFilters ?? {})}
      initialFilters={initialFilters}
    />
  );
}
