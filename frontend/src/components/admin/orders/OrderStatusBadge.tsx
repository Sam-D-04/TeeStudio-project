/**
 * OrderStatusBadge – hiển thị trạng thái đơn hàng dưới dạng nhãn màu.
 *
 * Mỗi trạng thái có một màu nền nhạt và màu chữ đậm tương ứng.
 * Ví dụ: "Hoàn tất" → nền xanh lá nhạt, chữ xanh lá đậm.
 */

// Danh sách tất cả trạng thái đơn hàng có thể có
export type OrderStatus =
  | "cho_xac_nhan"   // Chờ xác nhận
  | "da_xac_nhan"    // Đã xác nhận
  | "dang_san_xuat"  // Đang xử lý in
  | "dang_in"        // Đang xử lý in
  | "cho_giao"       // Chờ giao hàng
  | "dang_giao"      // Đang giao hàng
  | "hoan_tat"       // Hoàn tất
  | "da_huy";        // Đã hủy

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

// Cấu hình nhãn và màu sắc cho từng trạng thái
const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  cho_xac_nhan: {
    label: "Chờ xác nhận",
    // Nền xám nhạt, chữ xám trung tính
    className: "bg-[#f1f5f9] text-[#475569]",
  },
  da_xac_nhan: {
    label: "Đã xác nhận",
    // Nền xanh dương rất nhạt, chữ xanh dương
    className: "bg-[#cce5ff] text-[#004b73]",
  },
  dang_san_xuat: {
    label: "Đang xử lý in",
    // Nền xanh sky nhạt, chữ xanh sky đậm
    className: "bg-[#e0f2fe] text-[#0284c7]",
  },
  dang_in: {
    label: "Đang xử lý in",
    // Gộp cùng cách hiển thị với trạng thái đang sản xuất cũ
    className: "bg-[#e0f2fe] text-[#0284c7]",
  },
  cho_giao: {
    label: "Chờ giao hàng",
    // Nền vàng nhạt, chữ vàng đậm
    className: "bg-[#fef3c7] text-[#d97706]",
  },
  dang_giao: {
    label: "Đang giao hàng",
    // Nền cam nhạt, chữ cam đậm
    className: "bg-[#ffedd5] text-[#ea580c]",
  },
  hoan_tat: {
    label: "Hoàn tất",
    // Nền xanh lá nhạt, chữ xanh lá đậm
    className: "bg-[#dcfce7] text-[#059669]",
  },
  da_huy: {
    label: "Đã hủy",
    // Nền đỏ nhạt, chữ đỏ đậm
    className: "bg-[#fee2e2] text-[#b91c1c]",
  },
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-4 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
