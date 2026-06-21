/**
 * ProductStatusBadge – hiển thị trạng thái phôi áo (đang hiển thị / đang ẩn)
 * InventoryStatusBadge – hiển thị trạng thái tồn kho (còn hàng / sắp hết / hết hàng)
 *
 * Thiết kế: pill hình thuốc, màu nền nhạt + chữ đậm hơn theo ngữ nghĩa.
 */

// ===== LOẠI TRẠNG THÁI SẢN PHẨM =====
// "dang_hien_thi" : sản phẩm đang được hiển thị trên cửa hàng
// "dang_an"       : sản phẩm đã bị ẩn, khách không thấy
export type ProductDisplayStatus = "dang_hien_thi" | "dang_an";

// ===== LOẠI TRẠNG THÁI TỒN KHO =====
// "con_hang"  : số lượng > ngưỡng cảnh báo
// "sap_het"   : số lượng <= ngưỡng cảnh báo (ví dụ <= 20)
// "het_hang"  : số lượng = 0
export type InventoryStatus = "con_hang" | "sap_het" | "het_hang";

// ========================
// Badge trạng thái sản phẩm (Đang hiển thị / Đang ẩn)
// ========================
const displayStatusConfig: Record<
  ProductDisplayStatus,
  { label: string; className: string }
> = {
  dang_hien_thi: {
    label: "ĐANG HIỂN THỊ",
    // Nền xanh lá nhạt, chữ xanh lá đậm
    className: "bg-[#dcfce7] text-[#059669]",
  },
  dang_an: {
    label: "ĐANG ẨN",
    // Nền xám nhạt, chữ xám
    className: "bg-surface-container-high text-text-secondary",
  },
};

export function ProductDisplayStatusBadge({
  status,
}: {
  status: ProductDisplayStatus;
}) {
  const config = displayStatusConfig[status];
  return (
    <span
      className={`inline-flex min-h-6 items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wider ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// ========================
// Badge trạng thái tồn kho (Còn hàng / Sắp hết / Hết hàng)
// ========================
const inventoryStatusConfig: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  con_hang: {
    label: "CÒN HÀNG",
    // Chữ xanh lá, không có nền (dùng trong bảng biến thể nhỏ)
    className: "text-[#059669]",
  },
  sap_het: {
    label: "SẮP HẾT",
    // Chữ cam vàng
    className: "text-warning",
  },
  het_hang: {
    label: "HẾT HÀNG",
    // Chữ đỏ cam
    className: "text-error",
  },
};

export function InventoryStatusBadge({ status }: { status: InventoryStatus }) {
  const config = inventoryStatusConfig[status];
  return (
    <span className={`text-[11px] font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}
