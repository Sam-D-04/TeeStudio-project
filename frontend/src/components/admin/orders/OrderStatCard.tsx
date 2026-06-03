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
  icon: ReactNode;       // Icon SVG hoặc Ant Design icon
  iconWrapperClassName?: string; // Lớp màu nền icon
};

export default function OrderStatCard({
  label,
  value,
  icon,
  iconWrapperClassName = "bg-[#cce5ff] text-[#0284c7]",
}: OrderStatCardProps) {
  return (
    // Card nền trắng, bo góc 12px, viền 1px, shadow nhẹ
    // Khi hover: dịch lên 2px, đổi màu viền
    <div
      className="flex items-center justify-between rounded-xl border border-border bg-surface p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#76a1b6]"
    >
      {/* Phần chữ bên trái */}
      <div>
        {/* Nhãn nhỏ màu xám */}
        <p className="mb-1 text-body-sm text-text-secondary">{label}</p>
        {/* Con số lớn, đậm */}
        <p className="text-3xl font-bold text-text-main">{value}</p>
      </div>

      {/* Vòng tròn icon bên phải */}
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-full text-xl ${iconWrapperClassName}`}
      >
        {icon}
      </div>
    </div>
  );
}
