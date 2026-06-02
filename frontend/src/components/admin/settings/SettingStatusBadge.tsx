/**
 * SettingStatusBadge – Badge hiển thị trạng thái hoạt động của nhân viên.
 *
 * Hai trạng thái:
 * - "hoat_dong": Xanh lá (màu thành công) – nhân viên đang hoạt động
 * - "vo_hieu":   Xám – nhân viên bị vô hiệu hóa hoặc không còn làm
 */

// Hai trạng thái hợp lệ
export type StaffStatus = "hoat_dong" | "vo_hieu";

type SettingStatusBadgeProps = {
  status: StaffStatus;
};

export default function SettingStatusBadge({ status }: SettingStatusBadgeProps) {
  // Kiểm tra xem nhân viên có đang hoạt động không
  const isActive = status === "hoat_dong";

  return (
    // Badge dạng pill (bo tròn hoàn toàn)
    // Hiển thị chấm tròn nhỏ bên trái để làm tín hiệu trạng thái
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-[#dcfce7] text-[#10b981]"    // Xanh lá nhạt + chữ xanh lá
          : "bg-[#e4e9ed] text-[#475569]"    // Xám nhạt + chữ xám
      }`}
    >
      {/* Chấm tròn nhỏ làm chỉ thị trạng thái */}
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-[#10b981]" : "bg-[#94a3b8]"
        }`}
      />
      {/* Nhãn trạng thái */}
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}
