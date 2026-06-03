/**
 * InventoryStatusBadge – hiển thị trạng thái tồn kho dưới dạng nhãn màu.
 *
 * Mỗi trạng thái tồn kho có màu nền nhạt và màu chữ đậm tương ứng:
 * - "con_hang"  → Còn hàng  → nền xanh lá nhạt, chữ xanh lá
 * - "sap_het"   → Sắp hết   → nền vàng nhạt, chữ vàng đậm
 * - "het_hang"  → Hết hàng  → nền đỏ nhạt, chữ đỏ đậm
 */

// Kiểu dữ liệu cho trạng thái tồn kho
export type InventoryStatus = "con_hang" | "sap_het" | "het_hang";

type InventoryStatusBadgeProps = {
  status: InventoryStatus;
};

// Cấu hình nhãn và màu cho từng trạng thái
const statusConfig: Record<InventoryStatus, { label: string; className: string }> = {
  con_hang: {
    label: "Còn hàng",
    // Nền xanh lá nhạt (#dcfce7), chữ xanh lá đậm (#059669)
    className: "bg-[#dcfce7] text-[#059669]",
  },
  sap_het: {
    label: "Sắp hết",
    // Nền vàng nhạt (#fef3c7), chữ vàng đậm (#d97706)
    className: "bg-[#fef3c7] text-[#d97706]",
  },
  het_hang: {
    label: "Hết hàng",
    // Nền đỏ nhạt (#fee2e2), chữ đỏ đậm (#b91c1c)
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
};

export default function InventoryStatusBadge({ status }: InventoryStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    // Nhãn dạng pill: bo tròn hoàn toàn, chữ nhỏ đậm, padding nhỏ
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-4 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
