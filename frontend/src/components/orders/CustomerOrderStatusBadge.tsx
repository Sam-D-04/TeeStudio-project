"use client";

/**
 * CustomerOrderStatusBadge - hiển thị trạng thái đơn hàng dưới dạng nhãn có màu.
 *
 * Dùng chung cho cả trang "Đơn hàng của tôi" (danh sách) và trang chi tiết đơn.
 * Bảng màu giữ giống với OrderStatusBadge.tsx bên admin để trạng thái nhìn
 * quen mắt, không đổi ý nghĩa màu sắc giữa 2 phía admin/khách hàng.
 *
 * status truyền vào là giá trị gốc trong CustomerOrder.status ở DB (tiếng Anh),
 * KHÔNG phải bộ slug tiếng Việt (cho_xac_nhan...) mà admin đang dùng riêng.
 */

interface Props {
  status: string;
}

const CAU_HINH_MAU: Record<string, { label: string; nen: string; chu: string }> = {
  PENDING: {
    label: "Chờ xác nhận",
    nen: "#f1f5f9",
    chu: "#475569",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    nen: "#cce5ff",
    chu: "#004b73",
  },
  PROCESSING: {
    label: "Đang xử lý in",
    nen: "#e0f2fe",
    chu: "#0284c7",
  },
  PRINTING: {
    label: "Đang xử lý in",
    nen: "#e0f2fe",
    chu: "#0284c7",
  },
  READY_TO_SHIP: {
    label: "Chờ giao",
    nen: "#fef3c7",
    chu: "#d97706",
  },
  SHIPPING: {
    label: "Đang giao hàng",
    nen: "#ffedd5",
    chu: "#ea580c",
  },
  COMPLETED: {
    label: "Hoàn tất",
    nen: "#dcfce7",
    chu: "#059669",
  },
  CANCELLED: {
    label: "Đã hủy",
    nen: "#fee2e2",
    chu: "#b91c1c",
  },
};

// Trạng thái lạ (không nằm trong danh sách trên) vẫn hiển thị được, tránh vỡ giao diện
const CAU_HINH_MAC_DINH = { label: "Không xác định", nen: "#f1f5f9", chu: "#64748b" };

export default function CustomerOrderStatusBadge({ status }: Props) {
  const cauHinh = CAU_HINH_MAU[status] ?? CAU_HINH_MAC_DINH;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 12px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        background: cauHinh.nen,
        color: cauHinh.chu,
        whiteSpace: "nowrap",
      }}
    >
      {cauHinh.label}
    </span>
  );
}
