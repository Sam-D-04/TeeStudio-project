import Link from "next/link";
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
  href: string;
  isActive?: boolean;
};

export default function PaymentStatCard({
  label,
  value,
  icon,
  iconWrapperClassName = "bg-surface-alt text-text-secondary border border-border",
  badge,
  isAlert = false,
  href,
  isActive = false,
}: PaymentStatCardProps) {
  return (
    // Card nền trắng, bo góc 12px, viền 1px mảnh, shadow nhẹ
    // Khi hover: dịch lên 2px (chỉ áp dụng nếu không phải alert)
    <Link
      href={href}
      aria-label={`${label}. Bấm để lọc danh sách giao dịch`}
      aria-current={isActive ? "page" : undefined}
      className={`relative block min-w-0 cursor-pointer overflow-hidden rounded-xl border bg-surface p-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)] outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-container/30 ${
        isActive
          ? "border-primary-container ring-1 ring-primary-container/20"
          : isAlert
            ? "border-[#ffdad6]"
            : "border-border"
      }`}
    >
      {/* Đường kẻ đỏ bên phải – chỉ hiển thị khi isAlert=true */}
      {isAlert && (
        <div className="absolute right-0 top-0 h-full w-1 bg-[#ea580c]" />
      )}

      {/* Hàng trên: Icon bên trái + Badge tùy chọn bên phải */}
      <div className="mb-2 flex items-start justify-between gap-2">
        {/* Ô icon vuông 40x40, bo góc 8px */}
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[16px] ${iconWrapperClassName}`}
        >
          {icon}
        </div>

        {/* Badge nhỏ ở góc trên phải (tùy chọn) */}
        {badge && <div>{badge}</div>}
      </div>

      {/* Nhãn mô tả nhỏ màu xám */}
      <p className="mb-1 truncate text-xs leading-4 text-text-secondary" title={label}>
        {label}
      </p>

      {/* Giá trị lớn, đậm */}
      <div className="truncate text-xl font-extrabold leading-6 text-text-main">
        {value}
      </div>
    </Link>
  );
}
