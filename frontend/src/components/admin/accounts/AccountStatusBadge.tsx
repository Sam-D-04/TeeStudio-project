"use client";

import type { TrangThaiTaiKhoan } from "@/services/admin/accountService";

/**
 * AccountStatusBadge – Hiển thị badge trạng thái tài khoản khách hàng.
 * ACTIVE: xanh lá | INACTIVE: xám | SUSPENDED: đỏ cam
 */
export default function AccountStatusBadge({ status }: { status: TrangThaiTaiKhoan }) {
  const configs: Record<
    TrangThaiTaiKhoan,
    { label: string; bg: string; text: string }
  > = {
    ACTIVE: {
      label: "Đang hoạt động",
      bg: "#dcfce7",
      text: "#16a34a",
    },
    INACTIVE: {
      label: "Đã vô hiệu hóa",
      bg: "#f1f5f9",
      text: "#64748b",
    },
    SUSPENDED: {
      label: "Đã đình chỉ",
      bg: "#fff7ed",
      text: "#ea580c",
    },
  };

  const cfg = configs[status] ?? configs.INACTIVE;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: cfg.bg,
        color: cfg.text,
        borderRadius: 20,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
}
