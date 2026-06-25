import type { Metadata } from "next";
import DesignClient from "@/components/admin/designs/DesignClient";

/**
 * Metadata SEO cho trang Thiết kế & In ấn.
 * Được Next.js tự động đặt vào thẻ <title> và <meta name="description">.
 */
export const metadata: Metadata = {
  title: "Thiết kế & In ấn - TeeStudio Quản trị",
  description:
    "Quản lý thiết kế khách hàng, xét duyệt bản in, gửi đơn đến xưởng và cấu hình tài nguyên thiết kế tại TeeStudio.",
};

/**
 * ThietKePage – Server Component (mặc định trong Next.js App Router).
 *
 * File này chỉ khai báo metadata và render DesignClient.
 * Toàn bộ logic tương tác (state, event) nằm trong DesignClient và DesignPage.
 */
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function layGiaTriDauTien(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ThietKePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const tabParam = layGiaTriDauTien(params.tab).toUpperCase();
  const statusParam = layGiaTriDauTien(params.status).toUpperCase();
  const laTabDonIn = tabParam === "PRINT_ORDERS";

  const initialFilters = {
    tab: laTabDonIn
      ? ("don_can_in" as const)
      : ("thiet_ke_khach_hang" as const),
    designStatus:
      statusParam === "PENDING_REVIEW"
        ? "cho_kiem_tra"
        : statusParam === "NEEDS_REVISION"
          ? "can_chinh_sua"
          : statusParam === "APPROVED" && !laTabDonIn
            ? "da_duyet"
            : "",
    printStatus:
      laTabDonIn && statusParam === "APPROVED"
        ? "cho_gui_xuong"
        : laTabDonIn && statusParam === "PRINTING"
          ? "dang_in"
          : laTabDonIn && statusParam === "PACKED"
            ? "da_in_xong"
            : "",
  };

  return (
    <DesignClient
      key={JSON.stringify(initialFilters)}
      initialFilters={initialFilters}
    />
  );
}
