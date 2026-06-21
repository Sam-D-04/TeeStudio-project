/**
 * DesignStatusBadge – Badge trạng thái thiết kế khách hàng.
 *
 * Mỗi thiết kế có thể ở một trong ba trạng thái:
 *  - "cho_kiem_tra"  → Chờ kiểm tra  (nền vàng nhạt, chữ vàng đậm)
 *  - "can_chinh_sua" → Cần chỉnh sửa (nền cam nhạt, chữ cam)
 *  - "da_duyet"      → Đã duyệt      (nền xanh lá nhạt, chữ xanh lá)
 *
 * Cách dùng:
 *   <DesignStatusBadge trangThai="cho_kiem_tra" />
 */

// Kiểu dữ liệu cho trạng thái – khớp với giá trị ENUM từ backend
export type TrangThaiThietKe =
  | "cho_kiem_tra"
  | "can_chinh_sua"
  | "da_duyet";

// Bảng cấu hình màu sắc + nhãn hiển thị cho từng trạng thái
const CAU_HINH_TRANG_THAI: Record<
  TrangThaiThietKe,
  { nhan: string; mauNen: string; mauChu: string }
> = {
  cho_kiem_tra: {
    nhan: "Chờ kiểm tra",
    mauNen: "#fef3c7",   // Vàng nhạt
    mauChu: "#d97706",   // Vàng đậm
  },
  can_chinh_sua: {
    nhan: "Cần chỉnh sửa",
    mauNen: "#ffedd5",   // Cam nhạt
    mauChu: "#ea580c",   // Cam đậm
  },
  da_duyet: {
    nhan: "Đã duyệt",
    mauNen: "#dcfce7",   // Xanh lá nhạt
    mauChu: "#10b981",   // Xanh lá đậm
  },
};

type DesignStatusBadgeProps = {
  trangThai: TrangThaiThietKe;
};

export default function DesignStatusBadge({ trangThai }: DesignStatusBadgeProps) {
  // Lấy cấu hình màu và nhãn dựa theo trạng thái
  // Nếu trạng thái không hợp lệ thì hiển thị "Không xác định"
  const cauHinh = CAU_HINH_TRANG_THAI[trangThai];

  if (!cauHinh) {
    return (
      <span
        style={{
          display: "inline-block",
          padding: "2px 10px",
          borderRadius: 20,         // Hình pill bo tròn
          fontSize: 12,
          fontWeight: 700,
          background: "#e4e9ed",
          color: "#6e7881",
        }}
      >
        Không xác định
      </span>
    );
  }

  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,           // Hình pill bo tròn hoàn toàn
        fontSize: 12,
        fontWeight: 700,
        backgroundColor: cauHinh.mauNen,
        color: cauHinh.mauChu,
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {cauHinh.nhan}
    </span>
  );
}
