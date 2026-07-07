import Link from "next/link";
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
  /** URL dùng khi card là nút lọc điều hướng. Bỏ trống để giữ card chỉ đọc. */
  href?: string;
  /** Hành động dùng cho card dạng button, ví dụ reset toàn bộ bộ lọc. */
  onClick?: () => void;
  /** Hiển thị trạng thái card đang là bộ lọc được áp dụng. */
  isActive?: boolean;
};

export default function ProductStatCard({
  label,
  value,
  extraContent,
  accentColor,
  href,
  onClick,
  isActive = false,
}: ProductStatCardProps) {
  const cardClassName = `relative flex w-full flex-col overflow-hidden rounded-xl border bg-surface p-5 text-left shadow-[0_1px_4px_rgba(0,0,0,0.05)] outline-none transition-all duration-200 ${
    href || onClick
      ? "cursor-pointer hover:-translate-y-0.5 hover:border-[#76a1b6] focus-visible:ring-2 focus-visible:ring-primary-container/30"
      : ""
  } ${
    isActive
      ? "border-primary-container ring-1 ring-primary-container/20"
      : "border-border"
  }`;

  const content = (
    <>
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
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={`${label}: ${value}. Bấm để lọc danh sách`}
        aria-current={isActive ? "page" : undefined}
        className={cardClassName}
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`${label}: ${value}. Bấm để xóa toàn bộ bộ lọc`}
        aria-pressed={isActive}
        className={cardClassName}
      >
        {content}
      </button>
    );
  }

  return <article className={cardClassName}>{content}</article>;
}
