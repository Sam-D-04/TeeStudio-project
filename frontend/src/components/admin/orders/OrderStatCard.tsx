import Link from "next/link";
import type { ReactNode } from "react";

/**
 * OrderStatCard – thẻ thống kê KPI ở đầu trang quản lý đơn hàng.
 *
 * Hiển thị một con số lớn (ví dụ: 24 đơn mới) kèm nhãn mô tả và icon minh họa.
 * Thiết kế: nền trắng, viền mảnh, hover nâng nhẹ lên.
 */
type OrderStatCardProps = {
  label: string;         // Tên chỉ số, ví dụ "Đơn mới"
  value: string | number; // Giá trị, ví dụ 24
  href: string;
  icon: ReactNode;       // Icon SVG hoặc Ant Design icon
  iconWrapperClassName?: string; // Lớp màu nền icon
  isActive?: boolean;
};

export default function OrderStatCard({
  label,
  value,
  href,
  icon,
  iconWrapperClassName = "bg-[#cce5ff] text-[#0284c7]",
  isActive = false,
}: OrderStatCardProps) {
  return (
    // Card nền trắng, bo góc 12px, viền 1px, shadow nhẹ
    // Khi hover: dịch lên 2px, đổi màu viền
    <Link
      href={href}
      aria-label={`${label}: ${value}. Bấm để lọc danh sách đơn hàng`}
      aria-current={isActive ? "page" : undefined}
      className={`flex min-w-0 cursor-pointer items-center justify-between gap-3 rounded-lg border bg-surface px-4 py-3 shadow-[0_1px_4px_rgba(0,0,0,0.05)] outline-none transition-all duration-200 hover:-translate-y-0.5 hover:border-[#76a1b6] focus-visible:ring-2 focus-visible:ring-primary-container/30 ${
        isActive
          ? "border-primary-container ring-1 ring-primary-container/20"
          : "border-border"
      }`}
    >
      {/* Phần chữ bên trái */}
      <div className="min-w-0">
        {/* Nhãn nhỏ màu xám */}
        <p className="whitespace-nowrap text-body-sm text-text-secondary">{label}</p>
        {/* Con số lớn, đậm */}
        <p className="text-2xl font-bold leading-tight text-text-main">{value}</p>
      </div>

      {/* Vòng tròn icon bên phải */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg ${iconWrapperClassName}`}
      >
        {icon}
      </div>
    </Link>
  );
}
