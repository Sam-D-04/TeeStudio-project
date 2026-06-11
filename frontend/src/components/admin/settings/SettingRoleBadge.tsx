import type { UserRole } from "@/types/auth";

export type StaffRole = Exclude<UserRole, "CUSTOMER">;

const roleLabels: Record<StaffRole, string> = {
  ADMIN: "Quản trị viên",
  WAREHOUSE: "Thủ kho",
  PRODUCTION: "Thiết kế & in ấn",
};

const roleStyles: Record<StaffRole, string> = {
  ADMIN: "bg-[#e0f2fe] text-[#0284c7]",
  WAREHOUSE: "bg-[#cce5ff] text-[#004b73]",
  PRODUCTION: "bg-[#bee9ff] text-[#1e4c5f]",
};

export default function SettingRoleBadge({ role }: { role: StaffRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${roleStyles[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}
