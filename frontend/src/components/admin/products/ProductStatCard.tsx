import type { ReactNode } from "react";

/**
 * ProductStatCard – thẻ KPI nhỏ ở đầu trang quản lý phôi áo.
 *
 * Hiển thị một con số thống kê (ví dụ: 12 phôi áo) kèm nhãn mô tả.
 * Tùy chọn: có thể hiển thị badge cảnh báo bên cạnh số (dùng cho thẻ "Sắp hết hàng").
 *
 * Thiết kế: nền trắng, bo góc 12px, viền 1px, shadow nhẹ.
 */

type ProductStatCardProps = {
  /** Nhãn mô tả, ví dụ: "Tổng phôi áo" */
  label: string;
  /** Giá trị thống kê, ví dụ: 12 */
  value: number | string;
  /**
   * Nội dung phụ tùy chọn hiển thị bên cạnh con số.
   * Thường dùng để đặt badge cảnh báo.
   */
  extraContent?: ReactNode;
  /**
   * Màu sắc đường viền bên trái card (accent line).
   * Mặc định không có (undefined = không hiển thị).
   * Ví dụ: "#f59e0b" cho thẻ "Sắp hết hàng".
   */
  accentColor?: string;
};

export default function ProductStatCard({
  label,
  value,
  extraContent,
  accentColor,
}: ProductStatCardProps) {
  return (
    // Card nền trắng, bo góc 12px (rounded-xl), viền 1px, shadow nhẹ
    // Nếu có accentColor thì hiển thị đường viền màu bên phải
    <div className="relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-all duration-200 hover:-translate-y-0.5">
      {/* Đường accent màu bên phải (chỉ hiển thị nếu có accentColor) */}
      {accentColor && (
        <div
          className="absolute right-0 top-0 h-full w-1"
          style={{ backgroundColor: accentColor }}
        />
      )}

      {/* Nhãn nhỏ màu xám ở trên */}
      <span className="text-body-sm text-text-secondary">{label}</span>

      {/* Con số lớn + nội dung phụ (badge) bên cạnh */}
      <div className="mt-2 flex items-center gap-3">
        <span className="text-[28px] font-bold leading-none text-text-main">
          {value}
        </span>
        {/* Slot cho badge hoặc nội dung bổ sung */}
        {extraContent}
      </div>
    </div>
  );
}
