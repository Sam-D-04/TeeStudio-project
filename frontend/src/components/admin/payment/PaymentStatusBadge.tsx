/**
 * PaymentStatusBadge – hiển thị trạng thái giao dịch dưới dạng nhãn màu.
 *
 * Mỗi trạng thái có màu nền nhạt và màu chữ đậm riêng để dễ nhận biết.
 * Ví dụ: "Đã thanh toán" → nền xanh lá nhạt, chữ xanh lá.
 */

// Danh sách tất cả trạng thái giao dịch thanh toán có thể có
export type PaymentStatus =
  | "da_thanh_toan"    // Đã thanh toán thành công
  | "cho_thanh_toan"   // Chờ người dùng thanh toán
  | "that_bai"         // Thanh toán thất bại / lỗi cổng
  | "can_doi_soat";    // Cần đối soát thủ công với COD

type PaymentStatusBadgeProps = {
  status: PaymentStatus;
};

// Cấu hình nhãn tiếng Việt và lớp CSS màu sắc cho từng trạng thái
const statusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  da_thanh_toan: {
    label: "Đã thanh toán",
    // Nền xanh lá nhạt, chữ xanh lá đậm
    className: "bg-[#dcfce7] text-[#059669]",
  },
  cho_thanh_toan: {
    label: "Chờ thanh toán",
    // Nền vàng nhạt, chữ vàng đậm
    className: "bg-[#fef3c7] text-[#d97706]",
  },
  that_bai: {
    label: "Thất bại",
    // Nền đỏ nhạt, viền đỏ nhạt, chữ đỏ đậm
    className: "bg-[#fee2e2] text-[#b91c1c] border border-[#fca5a5]",
  },
  can_doi_soat: {
    label: "Cần đối soát",
    // Nền vàng đậm hơn, chữ nâu vàng – trạng thái cần chú ý
    className: "bg-[#fef9c3] text-[#854d0e] border border-[#fde047]",
  },
};

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold leading-4 ${config.className}`}
    >
      {config.label}
    </span>
  );
}
