import type { ReactNode } from "react";

/**
 * PaymentStatCard – thẻ thống kê KPI ở đầu trang quản lý thanh toán.
 *
 * Hiển thị:
 * - Icon minh họa
 * - Nhãn mô tả (ví dụ: "Tổng tiền đã thanh toán hôm nay")
 * - Giá trị lớn (ví dụ: "12.450.000đ")
 * - Badge tùy chọn (ví dụ: "+8%")
 *
 * Có hỗ trợ kiểu "alert" (isAlert=true) để hiển thị viền đỏ bên phải
 * cho các thẻ cần chú ý như "Giao dịch thất bại".
 */

type PaymentStatCardProps = {
  label: string;           // Tên chỉ số, ví dụ "Tổng tiền đã thanh toán hôm nay"
  value: ReactNode;        // Giá trị chính, ví dụ "12.450.000đ" hoặc <><span>18</span> đơn</>
  icon: ReactNode;         // Icon SVG hoặc Ant Design icon
  iconWrapperClassName?: string; // Lớp CSS màu nền/icon (mặc định: xám nhạt)
  badge?: ReactNode;       // Badge nhỏ ở góc trên phải (ví dụ: "+8%")
  isAlert?: boolean;       // Nếu true: vẽ thêm đường kẻ màu đỏ bên phải card
};

export default function PaymentStatCard({
  label,
  value,
  icon,
  iconWrapperClassName = "bg-surface-alt text-text-secondary border border-border",
  badge,
  isAlert = false,
}: PaymentStatCardProps) {
  return (
    // Card nền trắng, bo góc 12px, viền 1px mảnh, shadow nhẹ
    // Khi hover: dịch lên 2px (chỉ áp dụng nếu không phải alert)
    <div
      className={`relative overflow-hidden rounded-xl border bg-surface p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-transform duration-200 ${
        isAlert
          ? "border-[#ffdad6]" // Viền đỏ nhạt cho card cảnh báo
          : "border-border hover:-translate-y-0.5" // Viền bình thường + hover nâng nhẹ
      }`}
    >
      {/* Đường kẻ đỏ bên phải – chỉ hiển thị khi isAlert=true */}
      {isAlert && (
        <div className="absolute right-0 top-0 h-full w-1 bg-[#ea580c]" />
      )}

      {/* Hàng trên: Icon bên trái + Badge tùy chọn bên phải */}
      <div className="mb-4 flex items-start justify-between">
        {/* Ô icon vuông 40x40, bo góc 8px */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-[20px] ${iconWrapperClassName}`}
        >
          {icon}
        </div>

        {/* Badge nhỏ ở góc trên phải (tùy chọn) */}
        {badge && <div>{badge}</div>}
      </div>

      {/* Nhãn mô tả nhỏ màu xám */}
      <p className="mb-1 text-sm text-text-secondary">{label}</p>

      {/* Giá trị lớn, đậm */}
      <div className="text-2xl font-extrabold text-text-main">{value}</div>
    </div>
  );
}
