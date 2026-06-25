import Link from "next/link";
import type { ReactNode } from "react";

/**
 * PromotionStatCard – Thẻ thống kê KPI ở đầu trang Khuyến mãi & Báo giá.
 *
 * Hiển thị:
 *  - Nhãn mô tả (ví dụ: "Mã đang hoạt động")
 *  - Giá trị lớn (ví dụ: "12" hoặc "18.450.000đ")
 *  - Icon minh họa với màu nền khác nhau tùy loại thẻ
 */

type PromotionStatCardProps = {
  nhan: string;           // Nhãn mô tả, ví dụ "Mã đang hoạt động"
  giaTri: ReactNode;      // Giá trị chính, có thể là số hoặc chuỗi tiền
  icon: ReactNode;        // Icon SVG hoặc Ant Design icon
  mauNenIcon: string;     // Màu nền ô icon, ví dụ "#dcfce7"
  mauIcon: string;        // Màu icon, ví dụ "#10b981"
  href: string;           // URL bộ lọc khi Admin bấm vào thẻ
  isActive?: boolean;     // Đánh dấu bộ lọc của thẻ đang được áp dụng
};

export default function PromotionStatCard({
  nhan,
  giaTri,
  icon,
  mauNenIcon,
  mauIcon,
  href,
  isActive = false,
}: PromotionStatCardProps) {
  return (
    // Card nền trắng, bo góc 20px theo DESIGN.md, shadow rất nhẹ
    // Khi hover: viền đổi sang màu xanh nhạt (bae6fd)
    <Link
      href={href}
      aria-label={`${nhan}. Bấm để lọc danh sách mã khuyến mãi`}
      aria-current={isActive ? "page" : undefined}
      className="outline-none focus-visible:ring-2 focus-visible:ring-primary-container/30"
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: 20,
        border: `1px solid ${isActive ? "#0ea5e9" : "#e2e8f0"}`,
        boxShadow: isActive
          ? "0 0 0 1px rgba(14, 165, 233, 0.18)"
          : "0px 1px 4px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        transition: "border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
        color: "inherit",
        textDecoration: "none",
      }}
      // Hiệu ứng hover: đổi màu viền và nâng nhẹ thẻ
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "#76a1b6";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isActive ? "#0ea5e9" : "#e2e8f0";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Phần bên trái: nhãn + giá trị */}
      <div>
        {/* Nhãn mô tả nhỏ màu xám */}
        <p
          style={{
            fontSize: 13,
            color: "#475569",
            margin: "0 0 4px 0",
            lineHeight: "18px",
          }}
        >
          {nhan}
        </p>

        {/* Giá trị chính, chữ to đậm */}
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
            lineHeight: "36px",
            letterSpacing: "-0.02em",
          }}
        >
          {giaTri}
        </div>
      </div>

      {/* Ô icon tròn 40x40px */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: mauNenIcon,
          color: mauIcon,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </Link>
  );
}
