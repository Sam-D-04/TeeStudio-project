import type { ReactNode } from "react";

/**
 * SettingStatCard – Thẻ thống kê KPI ở đầu trang Cài đặt.
 *
 * Hiển thị:
 * - Icon minh họa (nền tròn màu nhạt)
 * - Nhãn mô tả (ví dụ: "Tài khoản nội bộ")
 * - Giá trị lớn (ví dụ: "8")
 * - Đơn vị tùy chọn (ví dụ: "nhóm", "đang bật")
 */

// Kiểu dữ liệu đầu vào của component
type SettingStatCardProps = {
  label: string;                  // Nhãn mô tả nhỏ phía trên số liệu
  value: string | number;         // Giá trị chính (số hoặc chuỗi)
  unit?: string;                  // Đơn vị hiển thị cạnh số (ví dụ: "nhóm")
  unitColor?: string;             // Màu CSS của đơn vị (mặc định: xám)
  icon: ReactNode;                // Icon SVG hoặc Ant Design icon
  iconWrapperClassName?: string;  // Màu nền vòng tròn icon
};

export default function SettingStatCard({
  label,
  value,
  unit,
  unitColor = "#94a3b8", // Màu xám mặc định cho đơn vị
  icon,
  iconWrapperClassName = "bg-[#e0f2fe] text-[#0ea5e9]",
}: SettingStatCardProps) {
  return (
    // Card nền trắng, bo góc 20px theo thiết kế, viền mảnh, shadow nhẹ
    // Hover: dịch lên 2px và đổi màu viền
    <div className="group flex items-start justify-between rounded-[20px] border border-border bg-surface p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-colors hover:border-[#76a1b6]">

      {/* Phần bên trái: nhãn + giá trị */}
      <div>
        {/* Nhãn mô tả nhỏ, màu xám */}
        <p className="mb-1 text-sm text-text-secondary">{label}</p>

        {/* Giá trị lớn, đậm */}
        <h3 className="text-[28px] font-extrabold leading-none text-on-surface">
          {value}
          {/* Đơn vị nhỏ cạnh số (nếu có) */}
          {unit && (
            <span
              className="ml-1 text-sm font-normal"
              style={{ color: unitColor }}
            >
              {unit}
            </span>
          )}
        </h3>
      </div>

      {/* Phần bên phải: vòng tròn icon */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[20px] ${iconWrapperClassName}`}
      >
        {icon}
      </div>
    </div>
  );
}
