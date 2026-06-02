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
};

export default function PromotionStatCard({
  nhan,
  giaTri,
  icon,
  mauNenIcon,
  mauIcon,
}: PromotionStatCardProps) {
  return (
    // Card nền trắng, bo góc 20px theo DESIGN.md, shadow rất nhẹ
    // Khi hover: viền đổi sang màu xanh nhạt (bae6fd)
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        transition: "border-color 0.2s ease",
        cursor: "default",
      }}
      // Hiệu ứng hover: đổi màu viền sang xanh nhạt
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#bae6fd";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
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
    </div>
  );
}
