import Link from "next/link";
import type { ReactNode } from "react";

/**
 * InventoryStatCard – thẻ thống kê KPI ở đầu trang quản lý kho hàng.
 *
 * Hiển thị:
 * - Icon tròn bên trên (màu thay đổi theo colorScheme)
 * - Nhãn mô tả chỉ số (ví dụ: "Tổng phôi áo còn tồn")
 * - Con số lớn (ví dụ: 2,480)
 * - Badge phụ bên cạnh (ví dụ: "+5%" hoặc "Cảnh báo") — tùy chọn
 *
 * Thiết kế: nền trắng, viền mảnh, shadow nhẹ, hover đổi màu viền.
 */

// Kiểu dữ liệu cho props của thẻ thống kê
type InventoryStatCardProps = {
  icon: ReactNode;            // Icon hiển thị trong vòng tròn
  title: string;              // Tên chỉ số, ví dụ "Tổng phôi áo còn tồn"
  value: string | number;     // Giá trị lớn, ví dụ "2,480"
  valueSuffix?: string;       // Hậu tố nhỏ bên cạnh giá trị, ví dụ "SKU"
  badge?: string;             // Nhãn phụ góc trên phải, ví dụ "+5%" hoặc "Cảnh báo"

  // Màu sắc theo ngữ nghĩa:
  // "success"  → xanh lá (icon xanh lá, border hover xanh lá)
  // "warning"  → vàng    (icon vàng, border hover vàng)
  // "accent"   → tím     (icon tím, border hover tím)
  // "default"  → xám     (icon xám, border hover xám)
  colorScheme?: "success" | "warning" | "accent" | "default";
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
};

// Ánh xạ colorScheme sang class Tailwind cho icon và viền hover
const colorMap = {
  success: {
    iconWrapper: "bg-[#dcfce7] text-[#059669]",   // Nền xanh lá nhạt, icon xanh lá
    hoverBorder: "hover:border-[#059669]/30",       // Viền xanh lá nhạt khi hover
    valueColor: "text-[#059669]",                   // Chữ giá trị màu xanh lá
    badgeClass: "bg-[#dcfce7] text-[#059669]",
  },
  warning: {
    iconWrapper: "bg-[#fef3c7] text-[#d97706]",
    hoverBorder: "hover:border-[#d97706]/30",
    valueColor: "text-[#d97706]",
    badgeClass: "bg-[#f8fafc] text-[#475569]",     // Badge "Cảnh báo" dùng xám
  },
  accent: {
    iconWrapper: "bg-[#ede9fe] text-[#6366f1]",
    hoverBorder: "hover:border-[#6366f1]/30",
    valueColor: "text-text-main",
    badgeClass: "bg-[#ede9fe] text-[#6366f1]",
  },
  default: {
    iconWrapper: "bg-[#f1f5f9] text-[#475569]",
    hoverBorder: "hover:border-[#76a1b6]",
    valueColor: "text-text-main",
    badgeClass: "bg-[#dcfce7] text-[#059669]",
  },
};

export default function InventoryStatCard({
  icon,
  title,
  value,
  valueSuffix,
  badge,
  colorScheme = "default",
  href,
  onClick,
  isActive = false,
}: InventoryStatCardProps) {
  // Lấy class màu theo colorScheme được truyền vào
  const colors = colorMap[colorScheme];

  const cardClassName = `block w-full rounded-[16px] border bg-surface p-6 text-left shadow-[0_1px_4px_rgba(0,0,0,0.05)] outline-none transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary-container/30 ${colors.hoverBorder} ${
    isActive
      ? "border-primary-container ring-1 ring-primary-container/20"
      : "border-border"
  }`;

  const content = (
    <>
      {/* Hàng trên: icon + badge */}
      <div className="mb-4 flex items-center justify-between">
        {/* Vòng tròn chứa icon, màu theo colorScheme */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${colors.iconWrapper}`}
        >
          {icon}
        </div>

        {/* Badge phụ (nếu có) ở góc trên phải */}
        {badge && (
          <span className={`rounded-full px-2 py-1 text-xs font-bold ${colors.badgeClass}`}>
            {badge}
          </span>
        )}
      </div>

      {/* Nhãn mô tả nhỏ, màu xám */}
      <p className="text-sm text-text-secondary">{title}</p>

      {/* Giá trị lớn */}
      <p className={`mt-1 text-[32px] font-black leading-tight ${colors.valueColor}`}>
        {value}
        {/* Hậu tố nhỏ bên cạnh (ví dụ: "SKU") */}
        {valueSuffix && (
          <span className="ml-1 text-sm font-normal text-text-secondary">{valueSuffix}</span>
        )}
      </p>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        aria-label={`${title}: ${value}. Bấm để lọc danh sách kho`}
        aria-current={isActive ? "page" : undefined}
        className={cardClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title}: ${value}. Bấm để xóa toàn bộ bộ lọc`}
      aria-pressed={isActive}
      className={cardClassName}
    >
      {content}
    </button>
  );
}
