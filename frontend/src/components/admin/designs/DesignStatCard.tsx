import type { ReactNode } from "react";

/**
 * DesignStatCard – Thẻ thống kê KPI ở đầu trang Thiết kế & In ấn.
 *
 * Hiển thị:
 *  - Nhãn mô tả (ví dụ: "Thiết kế chờ kiểm tra")
 *  - Giá trị lớn (số lượng)
 *  - Badge nhỏ phía trên-phải (ví dụ: "CẦN XỬ LÝ")
 *  - Icon minh họa với màu nền riêng
 *
 * Cách dùng:
 *   <DesignStatCard
 *     nhan="Thiết kế chờ kiểm tra"
 *     giaTri={9}
 *     icon={<SomeIcon />}
 *     mauNenIcon="#fef3c7"
 *     mauIcon="#d97706"
 *     nhanBadge="CẦN XỬ LÝ"
 *     mauNenBadge="#fef3c7"
 *     mauChuBadge="#d97706"
 *   />
 */

type DesignStatCardProps = {
  nhan: string;           // Mô tả ngắn bên dưới số, ví dụ "Thiết kế chờ kiểm tra"
  giaTri: ReactNode;      // Số lớn ở giữa card
  icon: ReactNode;        // Icon SVG hoặc Ant Design
  mauNenIcon: string;     // Màu nền ô icon, ví dụ "#fef3c7"
  mauIcon: string;        // Màu của icon, ví dụ "#d97706"
  nhanBadge?: string;     // Nhãn badge nhỏ góc phải, ví dụ "CẦN XỬ LÝ"
  mauNenBadge?: string;   // Màu nền badge
  mauChuBadge?: string;   // Màu chữ badge
};

export default function DesignStatCard({
  nhan,
  giaTri,
  icon,
  mauNenIcon,
  mauIcon,
  nhanBadge,
  mauNenBadge,
  mauChuBadge,
}: DesignStatCardProps) {
  return (
    // Card nền trắng, bo góc 20px theo DESIGN.md
    // Hover: đổi màu viền sang xanh nhạt bae6fd
    <div
      style={{
        background: "#ffffff",
        borderRadius: 20,
        padding: 20,
        border: "1px solid #e2e8f0",
        boxShadow: "0px 1px 4px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#bae6fd";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
      }}
    >
      {/* Hàng trên: icon + badge trạng thái */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Ô icon 40x40 nền màu nhạt */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,                // Bo góc vừa phải theo DESIGN.md
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

        {/* Badge nhỏ ở góc phải (tùy chọn) */}
        {nhanBadge && (
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,             // Hình pill
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
              backgroundColor: mauNenBadge,
              color: mauChuBadge,
              whiteSpace: "nowrap",
            }}
          >
            {nhanBadge}
          </span>
        )}
      </div>

      {/* Hàng dưới: số lớn + mô tả */}
      <div>
        {/* Số lớn – font 28px weight 800 */}
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

        {/* Mô tả nhỏ màu xám */}
        <p
          style={{
            fontSize: 13,
            color: "#475569",
            margin: "4px 0 0",
            lineHeight: "18px",
          }}
        >
          {nhan}
        </p>
      </div>
    </div>
  );
}
