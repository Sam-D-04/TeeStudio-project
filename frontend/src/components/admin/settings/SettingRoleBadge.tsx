/**
 * SettingRoleBadge – Badge hiển thị vai trò nhân viên.
 *
 * Mỗi vai trò có một bộ màu riêng để dễ phân biệt trực quan.
 * - Admin: Xanh da trời (primary)
 * - Kho: Xanh lam nhạt (secondary)
 * - Sản xuất: Xanh ngọc (tertiary)
 * - Kế toán: Xám (neutral)
 */

// Định nghĩa các vai trò hợp lệ trong hệ thống
export type StaffRole = "admin" | "kho" | "san_xuat" | "ke_toan";

// Nhãn hiển thị tiếng Việt cho từng vai trò
const ROLE_LABELS: Record<StaffRole, string> = {
  admin:     "Admin",
  kho:       "Kho",
  san_xuat:  "Sản xuất",
  ke_toan:   "Kế toán",
};

// Bộ màu nền và màu chữ cho từng vai trò
// Dùng màu nền nhạt + chữ đậm để tạo contrast tốt
const ROLE_STYLES: Record<StaffRole, string> = {
  admin:     "bg-[#e0f2fe] text-[#0284c7]",         // Xanh primary
  kho:       "bg-[#cce5ff] text-[#004b73]",          // Xanh secondary nhạt
  san_xuat:  "bg-[#bee9ff] text-[#1e4c5f]",          // Xanh tertiary nhạt
  ke_toan:   "bg-[#e4e9ed] text-[#475569]",          // Xám trung tính
};

type SettingRoleBadgeProps = {
  role: StaffRole; // Vai trò cần hiển thị
};

export default function SettingRoleBadge({ role }: SettingRoleBadgeProps) {
  return (
    // Badge bo góc 6px (dạng "rounded-md" – không tròn hoàn toàn)
    // Padding nhỏ, chữ 12px đậm
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${ROLE_STYLES[role]}`}
    >
      {ROLE_LABELS[role]}
    </span>
  );
}
