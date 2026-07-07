import type { Metadata } from "next";
import PromotionClient from "@/components/admin/promotions/PromotionClient";
import type { PromotionInitialFilters } from "@/components/admin/promotions/PromotionPage";

// Metadata SEO cho trang – Server Component xử lý phần này
export const metadata: Metadata = {
  title: "Khuyến mãi & Báo giá - TeeStudio Quản trị",
  description:
    "Quản lý mã giảm giá, bảng giá số lượng lớn, phụ phí in ấn và công thức tính giá tự động cho hệ thống TeeStudio.",
};

/**
 * KhuyenMaiBaoGiaPage – Server Component cho route /admin/khuyen-mai-bao-gia.
 *
 * Nhiệm vụ duy nhất: khai báo metadata SEO và render PromotionClient.
 * Toàn bộ logic giao diện nằm trong PromotionClient → PromotionPage.
 *
 * Trang này được bọc tự động trong AdminShell (sidebar + topbar)
 * thông qua file /app/admin/layout.tsx.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function KhuyenMaiBaoGiaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const status = layGiaTriDauTien(params.status).trim().toUpperCase();
  const expiresWithinDays = Number(
    layGiaTriDauTien(params.expiresWithinDays),
  );
  const usagePeriod = layGiaTriDauTien(params.usagePeriod)
    .trim()
    .toUpperCase();
  const discountPeriod = layGiaTriDauTien(params.discountPeriod)
    .trim()
    .toUpperCase();

  const initialFilters: PromotionInitialFilters = {
    trangThai:
      status === "ACTIVE"
        ? "dang_hoat_dong"
        : status === "INACTIVE"
          ? "tam_dung"
          : "",
    hetHanTrongNgay:
      status === "ACTIVE" &&
      Number.isInteger(expiresWithinDays) &&
      expiresWithinDays > 0 &&
      expiresWithinDays <= 365
        ? expiresWithinDays
        : undefined,
    kySuDung: usagePeriod === "THIS_MONTH" ? "THIS_MONTH" : undefined,
    kyGiamGia: discountPeriod === "THIS_MONTH" ? "THIS_MONTH" : undefined,
  };

  return (
    <PromotionClient
      key={JSON.stringify(initialFilters)}
      initialFilters={initialFilters}
    />
  );
}
