/**
 * PromotionStatusBadge – Huy hiệu trạng thái mã khuyến mãi.
 *
 * Mỗi trạng thái có màu nền và màu chữ riêng:
 *  - "dang_hoat_dong" → Xanh lá (thành công)
 *  - "tam_dung"       → Vàng cảnh báo
 *  - "het_han"        → Xám trung tính
 */

// Kiểu dữ liệu cho trạng thái mã khuyến mãi
// Phải khớp với giá trị enum từ Backend trả về
export type PromotionStatus =
  | "dang_hoat_dong"
  | "tam_dung"
  | "het_han"
  | "sap_dien_ra";

type PromotionStatusBadgeProps = {
  trangThai: PromotionStatus; // Trạng thái từ API
};

// Cấu hình hiển thị cho từng trạng thái
// Mỗi entry gồm: nhãn tiếng Việt + màu nền + màu chữ
const cauHinhTrangThai: Record<
  PromotionStatus,
  { nhan: string; nenBadge: string; chuBadge: string }
> = {
  dang_hoat_dong: {
    nhan: "Đang hoạt động",
    nenBadge: "#dcfce7", // Xanh lá rất nhạt
    chuBadge: "#10b981", // Xanh lá đậm
  },
  tam_dung: {
    nhan: "Tạm dừng",
    nenBadge: "#fef9c3", // Vàng rất nhạt
    chuBadge: "#ca8a04", // Vàng đậm
  },
  het_han: {
    nhan: "Hết hạn",
    nenBadge: "#e4e9ed", // Xám nhạt
    chuBadge: "#6e7881", // Xám vừa
  },
  sap_dien_ra: {
    nhan: "Sắp diễn ra",
    nenBadge: "#e0f2fe",
    chuBadge: "#0284c7",
  },
};

export default function PromotionStatusBadge({
  trangThai,
}: PromotionStatusBadgeProps) {
  // Lấy cấu hình màu tương ứng với trạng thái
  // Nếu backend trả về giá trị không hợp lệ → hiển thị "Không rõ" màu xám
  const cauHinh = cauHinhTrangThai[trangThai] ?? {
    nhan: "Không rõ",
    nenBadge: "#e4e9ed",
    chuBadge: "#6e7881",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 10px",
        borderRadius: 9999, // Pill shape
        backgroundColor: cauHinh.nenBadge,
        color: cauHinh.chuBadge,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {cauHinh.nhan}
    </span>
  );
}
