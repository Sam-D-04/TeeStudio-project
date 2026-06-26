import type { AccountStatus } from "@/types/auth";

export type StaffStatus = AccountStatus;

export default function AccountStaffStatusBadge({
  status,
}: {
  status: StaffStatus;
}) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "bg-[#dcfce7] text-[#10b981]"
          : "bg-[#e4e9ed] text-[#475569]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isActive ? "bg-[#10b981]" : "bg-[#94a3b8]"
        }`}
      />
      {isActive ? "Hoạt động" : "Vô hiệu"}
    </span>
  );
}
